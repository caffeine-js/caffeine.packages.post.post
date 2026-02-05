import { Post } from "@/domain/post";
import { UnpackPost } from "@/domain/services";
import type { IPost, IUnpackedPost } from "@/domain/types";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { UnexpectedCacheValueException } from "@caffeine/errors/infra";
import { redis } from "@caffeine/redis-drive";

export class PostRepository implements IPostRepository {
	private postCacheExpirationTime: number = 60 * 60;

	constructor(private readonly repository: IPostRepository) {}

	private getPost(key: string, data: string | IUnpackedPost): IPost {
		const { id, createdAt, updatedAt, ...properties }: IUnpackedPost =
			typeof data === "string" ? JSON.parse(data) : data;

		try {
			return Post.make(properties, { id, createdAt, updatedAt });
		} catch (err: unknown) {
			if (err instanceof InvalidDomainDataException)
				throw new UnexpectedCacheValueException(
					key,
					err.layerName,
					err.message,
				);

			throw err;
		}
	}

	private getPosts(key: string, data: string): IPost[] {
		try {
			const posts = JSON.parse(data);

			if (!Array.isArray(posts))
				throw new UnexpectedCacheValueException(key, "post@post");

			return posts.map((post) => this.getPost(key, post));
		} catch (err: unknown) {
			if (err instanceof InvalidDomainDataException)
				throw new UnexpectedCacheValueException(
					key,
					err.layerName,
					err.message,
				);

			throw err;
		}
	}

	async create(post: Post): Promise<void> {
		await this.repository.create(post);

		await this.invalidateListCache();
	}

	async findById(id: string): Promise<IPost | null> {
		const storedPost = await redis.get(`post@post::$${id}`);

		if (storedPost)
			return storedPost === null
				? null
				: this.getPost(`post@post::$${id}`, storedPost);

		const targetPost = await this.repository.findById(id);

		if (!targetPost) return null;

		await this.cachePost(targetPost);

		return targetPost;
	}

	async findBySlug(slug: string): Promise<IPost | null> {
		const storedPost = await redis.get(`post@post::${slug}`);

		if (storedPost) return this.getPost(`post@post::${slug}`, storedPost);

		const targetPost = await this.repository.findBySlug(slug);

		if (!targetPost) return null;

		await this.cachePost(targetPost);

		return targetPost;
	}

	async findMany(page: number): Promise<IPost[]> {
		const storedPosts = await redis.get(`post@post:page::${page}`);

		if (storedPosts)
			return this.getPosts(`post@post:page::${page}`, storedPosts);

		const targetPosts = await this.repository.findMany(page);

		await redis.set(
			`post@post:page::${page}`,
			JSON.stringify(targetPosts.map((post) => UnpackPost.run(post))),
			"EX",
			this.postCacheExpirationTime,
		);

		return targetPosts;
	}

	async findManyByPostType(postTypeId: string, page: number): Promise<IPost[]> {
		const key = `post@post:type::$${postTypeId}:page::${page}`;
		const storedPosts = await redis.get(key);

		if (storedPosts)
			return this.getPosts(
				`post@post:type::$${postTypeId}:page::${page}`,
				storedPosts,
			);

		const targetPosts = await this.repository.findManyByPostType(
			postTypeId,
			page,
		);

		await redis.set(
			key,
			JSON.stringify(targetPosts.map((post) => UnpackPost.run(post))),
			"EX",
			this.postCacheExpirationTime,
		);

		return targetPosts;
	}

	async update(post: Post): Promise<void> {
		const _cachedPost = await redis.get(`post@post::$${post.id}`);

		if (_cachedPost) {
			const cachedPost: IPost = this.getPost(
				`post@post::$${post.id}`,
				_cachedPost,
			);

			await redis.del(`post@post::$${cachedPost.id}`);
			await redis.del(`post@post::${cachedPost.slug}`);
		}

		await this.repository.update(post);

		await this.cachePost(post);
		await this.invalidateListCache();
	}

	async delete(post: Post): Promise<void> {
		await redis.del(`post@post::$${post.id}`);
		await redis.del(`post@post::${post.slug}`);

		await this.repository.delete(post);
		await this.invalidateListCache();
	}

	count(): Promise<number> {
		return this.repository.count();
	}

	private async cachePost(_post: IPost): Promise<void> {
		const post = UnpackPost.run(_post);

		await redis.set(
			`post@post::$${post.id}`,
			JSON.stringify(post),
			"EX",
			this.postCacheExpirationTime,
		);
		await redis.set(
			`post@post::${post.slug}`,
			JSON.stringify(post),
			"EX",
			this.postCacheExpirationTime,
		);
	}

	private async invalidateListCache(): Promise<void> {
		const patterns = ["post@post:page:*", "post@post:type:*"];

		for (const pattern of patterns) {
			let cursor = "0";
			do {
				const [newCursor, keys] = await redis.scan(
					cursor,
					"MATCH",
					pattern,
					"COUNT",
					100,
				);

				cursor = newCursor;

				if (keys.length > 0) {
					await redis.del(...keys);
				}
			} while (cursor !== "0");
		}
	}
}
