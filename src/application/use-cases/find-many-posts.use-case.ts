import type { IPostRepository } from "@/domain/types/post-repository.interface";
import type { IPostTagRepository } from "@/domain/types/post-tag-repository.interface";
import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { ICompletePost } from "../types/complete-post.interface";
import { FindPostTagsService } from "../services/find-post-tags.service";
import type { PaginationDTO } from "@caffeine/models/dtos";
import { FindPostTypesService } from "../services/find-post-types.service";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class FindManyPostsUseCase {
	private readonly findPostTags: FindPostTagsService;
	private readonly findPostTypes: FindPostTypesService;

	public constructor(
		private readonly repository: IPostRepository,
		readonly postTypeRepository: IPostTypeRepository,
		readonly postTagRepository: IPostTagRepository,
	) {
		this.findPostTags = new FindPostTagsService(postTagRepository);
		this.findPostTypes = new FindPostTypesService(postTypeRepository);
	}

	public async run({ page }: PaginationDTO): Promise<ICompletePost[]> {
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

			const postType = postTypes[postTypeId];

			if (!postType)
				throw new ResourceNotFoundException(
					`post@post::postType->${postTypeId}`,
				);

			const tags = tagIds.map((tag) => {
				const value = postTags[tag];

				if (!value)
					throw new ResourceNotFoundException(`post@post::tags->${tag}`);

				return value;
			});

			return {
				...properties,
				postType,
				tags,
			};
		});
	}
}
