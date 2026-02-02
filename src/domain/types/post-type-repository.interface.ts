import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";

export interface IPostTypeRepository {
	findById(slug: string): Promise<IUnmountedPostType | null>;
}
