import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";

export interface IPostTagRepository {
	findById(id: string): Promise<IUnmountedPostTag | null>;
}
