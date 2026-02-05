import type { IPost } from "@/domain/types";
import type { ICompletePost } from "../types/complete-post.interface";
import type { FindPostTagsService } from "./find-post-tags.service";
import type { FindPostTypeByIdService } from "./find-post-type-by-id.service";
import { UnpackPost } from "@/domain/services";

export class PopulatePostService {
	public constructor(
		private readonly findPostTags: FindPostTagsService,
		private readonly findPostTypeById: FindPostTypeByIdService,
	) {}

	public async run(post: IPost): Promise<ICompletePost> {
		const [tags, postType] = await Promise.all([
			this.findPostTags.run(post.tags),
			this.findPostTypeById.run(post.postTypeId),
		]);

		const { tags: _1, postTypeId: _2, ...properties } = UnpackPost.run(post);

		return {
			...properties,
			tags,
			postType,
		};
	}
}
