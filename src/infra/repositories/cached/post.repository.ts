import type { Post } from "@/domain/post";
import type { IUnmountedPost } from "@/domain/types";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import { redis } from "@caffeine/redis-drive";

export class PostRepository implements IPostRepository {
	private postCacheExpirationTime: number = 60 * 60;

	constructor(private readonly repository: IPostRepository) {}

	async create(post: Post): Promise<void> {
		await this.repository.create(post);

		await this.invalidateListCache();
	}

	async findById(id: string): Promise<IUnmountedPost | null> {
		const storedPost = await redis.get(`post@post::$${id}`);

		if (storedPost) return storedPost === null ? null : JSON.parse(storedPost);

		const targetPost = await this.repository.findById(id);

		if (!targetPost) return null;

		await this.cachePost(targetPost);

		return targetPost;
	}

	async findBySlug(slug: string): Promise<IUnmountedPost | null> {
		const storedPost = await redis.get(`post@post::${slug}`);

		if (storedPost) return storedPost === null ? null : JSON.parse(storedPost);

		const targetPost = await this.repository.findBySlug(slug);

		if (!targetPost) return null;

		await this.cachePost(targetPost);

		return targetPost;
	}

	async findMany(page: number): Promise<IUnmountedPost[]> {
		const storedPosts = await redis.get(`post@post:page::${page}`);

		if (storedPosts) return JSON.parse(storedPosts);

		const targetPosts = await this.repository.findMany(page);

		await redis.set(
			`post@post:page::${page}`,
			JSON.stringify(targetPosts),
			"EX",
			this.postCacheExpirationTime,
		);

		return targetPosts;
	}

	async findManyByPostType(
		postType: IUnmountedPostType,
		page: number,
	): Promise<IUnmountedPost[]> {
		const key = `post@post:type::$${postType.id}:page::${page}`;
		const storedPosts = await redis.get(key);

		if (storedPosts) return JSON.parse(storedPosts);

		const targetPosts = await this.repository.findManyByPostType(
			postType,
			page,
		);

		await redis.set(
			key,
			JSON.stringify(targetPosts),
			"EX",
			this.postCacheExpirationTime,
		);

		return targetPosts;
	}

	async update(post: Post): Promise<void> {
		const _cachedPost = await redis.get(`post@post::$${post.id}`);

		if (_cachedPost) {
			const cachedPost: IUnmountedPost = JSON.parse(_cachedPost);

			await redis.del(`post@post::$${cachedPost.id}`);
			await redis.del(`post@post::${cachedPost.slug}`);
		}

		await this.repository.update(post);

		await this.cachePost(post.unpack());
		await this.invalidateListCache();
	}

	async delete(post: Post): Promise<void> {
		await redis.del(`post@post::$${post.id}`);
		await redis.del(`post@post::${post.slug}`);

		await this.repository.delete(post);
		await this.invalidateListCache();
	}

	length(): Promise<number> {
		return this.repository.length();
	}

	private async cachePost(post: IUnmountedPost): Promise<void> {
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
		const pageKeys = await redis.keys("post@post:page:*");
		const typeKeys = await redis.keys("post@post:type:*");

		if (pageKeys.length > 0) await redis.del(...pageKeys);
		if (typeKeys.length > 0) await redis.del(...typeKeys);
	}
}
