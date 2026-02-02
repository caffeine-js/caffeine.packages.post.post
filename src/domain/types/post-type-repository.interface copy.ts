import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";

export interface IPostTypeRepository {
	findBySlug(slug: string): Promise<IUnmountedPostType | null>;
}
