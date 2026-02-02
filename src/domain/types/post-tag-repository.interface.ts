import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";

export interface IPostTagRepository {
	findBySlug(slug: string): Promise<IUnmountedPostTag | null>;
}
