import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import type { IPostTypeRepository } from "@/domain/types/repositories/post-type-repository.interface";
import type { ICompletePost } from "../types/complete-post.interface";
import { FindPostTagsService } from "../services/find-post-tags.service";
import { FindPostTypesService } from "../services/find-post-types.service";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";

export class FindManyPostsUseCase {
	private readonly findPostTags: FindPostTagsService;
	private readonly findPostTypes: FindPostTypesService;

	public constructor(
		private readonly repository: IPostRepository,
		private readonly postTypeRepository: IPostTypeRepository,
		private readonly postTagRepository: IPostTagRepository,
	) {
		this.findPostTags = new FindPostTagsService(postTagRepository);
		this.findPostTypes = new FindPostTypesService(postTypeRepository);
	}

	public async run(page: number): Promise<ICompletePost[]> {
		const posts = await this.repository.findMany(page);

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
			const { tags: tagIds, postTypeId, ...properties } = post;

			const postType = postTypes[postTypeId]!;
			const tags = tagIds.map((tag) => postTags[tag]!);

			return {
				...properties,
				postType,
				tags,
			};
		});
	}
}
