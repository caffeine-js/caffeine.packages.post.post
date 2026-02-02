import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";

export interface IPostTagRepository {
	findById(slug: string): Promise<IUnmountedPostTag | null>;
}
