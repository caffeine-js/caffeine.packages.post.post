import type { Post } from "../post";
import type { IUnmountedPost } from "./unmounted-post.interface";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";

export interface IPostRepository {
	create(post: Post): Promise<void>;
	findById(id: string): Promise<IUnmountedPost | null>;
	findBySlug(slug: string): Promise<IUnmountedPost | null>;
	findMany(page: number): Promise<IUnmountedPost[]>;
	findManyByPostType(
		postType: IUnmountedPostType,
		page: number,
	): Promise<IUnmountedPost[]>;
	update(post: Post): Promise<void>;
	delete(post: Post): Promise<void>;
	length(): Promise<number>;
}
