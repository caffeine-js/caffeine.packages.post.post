import type { IPostRepository } from "@/domain/types/post-repository.interface";
import type { IPostTagRepository } from "@/domain/types/post-tag-repository.interface";
import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { ICompletePost } from "../types/complete-post.interface";
import { FindPostTagsService } from "../services/find-post-tags.service";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import { FindPostTypeBySlugService } from "../services/find-post-type-by-slug.service";
import type { FindManyPostsByPostTypeDTO } from "../dtos/find-many-posts-by-post-type.dto";

export class FindManyPostsByPostTypeUseCase {
	private readonly findPostTags: FindPostTagsService;
	private readonly findPostTypeBySlug: FindPostTypeBySlugService;

	public constructor(
		private readonly repository: IPostRepository,
		readonly postTypeRepository: IPostTypeRepository,
		readonly postTagRepository: IPostTagRepository,
	) {
		this.findPostTags = new FindPostTagsService(postTagRepository);
		this.findPostTypeBySlug = new FindPostTypeBySlugService(postTypeRepository);
	}

	public async run({
		page,
		postType: _postType,
	}: FindManyPostsByPostTypeDTO): Promise<ICompletePost[]> {
		const postType = await this.findPostTypeBySlug.run(_postType);
		const posts = await this.repository.findManyByPostType(postType, page);

		const postTagsIds = [...new Set(posts.flatMap((post) => post.tags))];

		const postTags: Record<string, IUnmountedPostTag> = Object.fromEntries(
			(await this.findPostTags.run(postTagsIds)).map((postTag) => [
				postTag.id,
				postTag,
			]),
		);

		return posts.map((post) => {
			const { tags: tagIds, postTypeId, ...properties } = post;

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
