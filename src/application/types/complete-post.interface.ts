import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IEntity } from "@caffeine/models/types";

export interface ICompletePost extends IEntity {
	postType: IUnmountedPostType;
	name: string;
	slug: string;
	description: string;
	cover: string;
	tags: IUnmountedPostTag[];
}
