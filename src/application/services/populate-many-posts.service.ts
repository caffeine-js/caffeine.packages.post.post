import type { IPost } from "@/domain/types";
import type { ICompletePost } from "../types/complete-post.interface";
import type { FindPostTagsService } from "./find-post-tags.service";
import type { FindPostTypesService } from "./find-post-types.service";
import { UnpackPost } from "@/domain/services";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";

export class PopulateManyPostsService {
	public constructor(
		private readonly findPostTags: FindPostTagsService,
		private readonly findPostTypes: FindPostTypesService,
	) {}

	public async run(posts: IPost[]): Promise<ICompletePost[]> {
		if (posts.length === 0) return [];

		const postTypeIds = [...new Set(posts.map((post) => post.postTypeId))];
		const postTagsIds = [...new Set(posts.flatMap((post) => post.tags))];

		const [postTypesMap, postTagsMap] = await Promise.all([
			this.findPostTypes.run(postTypeIds),
			this.findPostTags.run(postTagsIds),
		]);

		const postTypes: Record<string, IUnmountedPostType> = Object.fromEntries(
			postTypesMap.map((postType) => [postType.id, postType]),
		);

		const postTags: Record<string, IUnmountedPostTag> = Object.fromEntries(
			postTagsMap.map((postTag) => [postTag.id, postTag]),
		);

		return posts.map((post) => {
			const { tags: tagIds, postTypeId, ...properties } = UnpackPost.run(post);

			const postType = postTypes[postTypeId];
			// If for some reason the type is missing (data inconsistency), we might want to throw or handle it.
			// Ideally, consistency is guaranteed, but let's assume it exists for now or use ! as in original code.
			// However, let's be safer: if not found, it might be a partial data issue.
			// Sticking to original logic where it expects it to exist.

			const tags = tagIds
				.map((tag) => postTags[tag])
				.filter((t): t is IUnmountedPostTag => !!t);

			return {
				...properties,
				postType: postType!,
				tags,
			};
		});
	}
}
