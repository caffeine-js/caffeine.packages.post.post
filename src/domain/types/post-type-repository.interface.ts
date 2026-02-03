import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";

export interface IPostTypeRepository {
	findById(id: string): Promise<IUnmountedPostType | null>;
	findBySlug(slug: string): Promise<IUnmountedPostType | null>;
}
