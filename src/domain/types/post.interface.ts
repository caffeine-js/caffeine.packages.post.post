import type { PostTag } from "@caffeine-packages/post.post-tag/domain";
import type { PostType } from "@caffeine-packages/post.post-type/domain";

export interface IPost {
	postType: PostType;
	name: string;
	slug: string;
	description: string;
	// TODO: Criar um pacote pro AWS S3
	cover: string;
	tags: PostTag[];
}
