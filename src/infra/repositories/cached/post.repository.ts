import { UnpackPost } from "@/domain/services";
import type { IPost } from "@/domain/types";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import { redis } from "@caffeine/redis-drive";
import { CachedPostMapper } from "./cached-post.mapper";
import { CACHE_EXPIRATION_TIME } from "@caffeine/constants";

export class PostRepository implements IPostRepository {
	private postCacheExpirationTime: number = CACHE_EXPIRATION_TIME.SAFE;

	constructor(private readonly repository: IPostRepository) {}

	async create(post: IPost): Promise<void> {
		await this.repository.create(post);

		await this.invalidateListCache();
	}

	async findById(id: string): Promise<IPost | null> {
		const storedPost = await redis.get(`post@post::$${id}`);

		if (storedPost)
			return storedPost === null
				? null
				: CachedPostMapper.run(`post@post::$${id}`, storedPost);

		const targetPost = await this.repository.findById(id);

		if (!targetPost) return null;

		await this.cachePost(targetPost);

		return targetPost;
	}

	async findBySlug(slug: string): Promise<IPost | null> {
		const storedId = await redis.get(`post@post::${slug}`);

		if (storedId) {
			const post = await this.findById(storedId);

			if (post && post.slug === slug) return post;
		}

		const targetPost = await this.repository.findBySlug(slug);

		if (!targetPost) return null;

		await this.cachePost(targetPost);

		return targetPost;
	}

	async findMany(page: number): Promise<IPost[]> {
		const key = `post@post:page::${page}`;
		const storedIds = await redis.get(key);

		if (storedIds) {
			const ids: string[] = JSON.parse(storedIds);
			return (await this.findManyByIds(ids)).filter(
				(post): post is IPost => post !== null,
			);
		}

		const targetPosts = await this.repository.findMany(page);

		await Promise.all(targetPosts.map((post) => this.cachePost(post)));

		await redis.set(
			key,
			JSON.stringify(targetPosts.map((post) => post.id)),
			"EX",
			this.postCacheExpirationTime,
		);

		return targetPosts;
	}

	async findManyByIds(ids: string[]): Promise<Array<IPost | null>> {
		if (ids.length === 0) return [];

		const keys = ids.map((id) => `post@post::$${id}`);
		const cachedValues = await redis.mget(...keys);

		const postsMap = new Map<string, IPost>();
		const missedIds: string[] = [];

		for (let i = 0; i < ids.length; i++) {
			const id = ids[i];
			if (!id) continue;

			const cached = cachedValues[i];

			if (cached) {
				try {
					const post = CachedPostMapper.run(`post@post::$${id}`, cached);
					postsMap.set(id, post);
				} catch {
					missedIds.push(id);
				}
			} else {
				missedIds.push(id);
			}
		}

		if (missedIds.length > 0) {
			const fetchedPosts = await this.repository.findManyByIds(missedIds);

			for (const post of fetchedPosts) {
				if (post) {
					await this.cachePost(post);
					postsMap.set(post.id, post);
				}
			}
		}

		return ids.map((id) => postsMap.get(id) ?? null);
	}

	async findManyByPostType(postTypeId: string, page: number): Promise<IPost[]> {
		const key = `post@post:type::$${postTypeId}:page::${page}`;
		const storedIds = await redis.get(key);

		if (storedIds) {
			const ids: string[] = JSON.parse(storedIds);
			return (await this.findManyByIds(ids)).filter(
				(post): post is IPost => post !== null,
			);
		}

		const targetPosts = await this.repository.findManyByPostType(
			postTypeId,
			page,
		);

		await Promise.all(targetPosts.map((post) => this.cachePost(post)));

		await redis.set(
			key,
			JSON.stringify(targetPosts.map((post) => post.id)),
			"EX",
			this.postCacheExpirationTime,
		);

		return targetPosts;
	}

	async update(post: IPost): Promise<void> {
		const _cachedPost = await redis.get(`post@post::$${post.id}`);

		if (_cachedPost) {
			const cachedPost: IPost = CachedPostMapper.run(
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

	async delete(post: IPost): Promise<void> {
		await redis.del(`post@post::$${post.id}`);
		await redis.del(`post@post::${post.slug}`);

		await this.repository.delete(post);
		await this.invalidateListCache();
	}

	count(): Promise<number> {
		return this.repository.count();
	}

	countByPostType(postType: string): Promise<number> {
		return this.repository.countByPostType(postType);
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
			post.id,
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
