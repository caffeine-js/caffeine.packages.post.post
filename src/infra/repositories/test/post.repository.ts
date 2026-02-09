import { Post } from "@/domain";
import { UnpackPost } from "@/domain/services";
import type { IPost, IUnpackedPost } from "@/domain/types";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";

export class PostRepository implements IPostRepository {
	private posts: Map<string, IUnpackedPost> = new Map();

	private readonly PAGE_SIZE = MAX_ITEMS_PER_QUERY;

	async create(post: IPost): Promise<void> {
		const unpacked = UnpackPost.run(post);

		if (this.posts.has(unpacked.id)) {
			throw new Error(`Post com ID ${unpacked.id} já existe`);
		}

		this.posts.set(unpacked.id, unpacked);
	}

	async findById(id: string): Promise<IPost | null> {
		const raw = this.posts.get(id);
		if (!raw) return null;
		return this.hydrate(raw);
	}

	async findBySlug(slug: string): Promise<IPost | null> {
		for (const post of this.posts.values()) {
			if (post.slug === slug) {
				return this.hydrate(post);
			}
		}
		return null;
	}

	async findManyByIds(ids: string[]): Promise<Array<IPost | null>> {
		return ids.map((id) => {
			const raw = this.posts.get(id);
			if (!raw) return null;
			return this.hydrate(raw);
		});
	}

	async findMany(page: number): Promise<IPost[]> {
		const allPosts = Array.from(this.posts.values());
		const paginatedCalls = this.paginate(allPosts, page);
		return paginatedCalls.map((p) => this.hydrate(p));
	}

	async findManyByPostType(postTypeId: string, page: number): Promise<IPost[]> {
		const filteredPosts = Array.from(this.posts.values()).filter(
			(post) => post.postTypeId === postTypeId,
		);
		const paginated = this.paginate(filteredPosts, page);
		return paginated.map((p) => this.hydrate(p));
	}

	async update(post: IPost): Promise<void> {
		const unpacked: IUnpackedPost = {
			id: post.id,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt,
			postTypeId: post.postTypeId,
			name: post.name,
			slug: post.slug,
			description: post.description,
			cover: post.cover,
			tags: post.tags,
		};

		if (!this.posts.has(unpacked.id)) {
			throw new Error(`Post com ID ${unpacked.id} não encontrado`);
		}

		this.posts.set(unpacked.id, unpacked);
	}

	async delete(post: IPost): Promise<void> {
		if (!this.posts.has(post.id)) {
			throw new Error(`Post com ID ${post.id} não encontrado`);
		}

		this.posts.delete(post.id);
	}

	async count(): Promise<number> {
		return this.posts.size;
	}

	async countByPostType(postTypeId: string): Promise<number> {
		return Array.from(this.posts.values()).filter(
			(post) => post.postTypeId === postTypeId,
		).length;
	}

	private paginate(items: IUnpackedPost[], page: number): IUnpackedPost[] {
		const startIndex = (page - 1) * this.PAGE_SIZE;
		const endIndex = startIndex + this.PAGE_SIZE;
		return items.slice(startIndex, endIndex);
	}

	clear(): void {
		this.posts.clear();
	}

	getAll(): IUnpackedPost[] {
		return Array.from(this.posts.values());
	}

	private hydrate(raw: IUnpackedPost): IPost {
		return Post.make(
			{
				name: raw.name,
				description: raw.description,
				cover: raw.cover,
				postTypeId: raw.postTypeId,
				tags: raw.tags,
			},
			{
				id: raw.id,
				createdAt: raw.createdAt,
				updatedAt: raw.updatedAt,
			},
		);
	}
}
