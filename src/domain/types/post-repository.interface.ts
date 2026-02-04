import type { IPost } from "./post.interface";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";

export interface IPostRepository {
	create(post: IPost): Promise<void>;
	findById(id: string): Promise<IPost | null>;
	findBySlug(slug: string): Promise<IPost | null>;
	findMany(page: number): Promise<IPost[]>;
	findManyByPostType(
		postType: IUnmountedPostType,
		page: number,
	): Promise<IPost[]>;
	update(post: IPost): Promise<void>;
	delete(post: IPost): Promise<void>;
	length(): Promise<number>;
}
