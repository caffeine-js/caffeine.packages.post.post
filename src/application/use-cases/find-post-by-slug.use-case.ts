import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import type { IPostTypeRepository } from "@/domain/types/repositories/post-type-repository.interface";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { ICompletePost } from "../types/complete-post.interface";
import { FindPostTypeByIdService } from "../services/find-post-type-by-id.service";
import { FindPostTagsService } from "../services/find-post-tags.service";

export class FindPostBySlugUseCase {
	private readonly findPostTags: FindPostTagsService;
	private readonly findPostTypeById: FindPostTypeByIdService;

	public constructor(
		private readonly repository: IPostRepository,
		private readonly postTypeRepository: IPostTypeRepository,
		private readonly postTagRepository: IPostTagRepository,
	) {
		this.findPostTags = new FindPostTagsService(postTagRepository);
		this.findPostTypeById = new FindPostTypeByIdService(postTypeRepository);
	}

	public async run(slug: string): Promise<ICompletePost> {
		const targetPost = await this.repository.findBySlug(slug);

		if (!targetPost) throw new ResourceNotFoundException(`post@post`);

		const [tags, postType] = await Promise.all([
			this.findPostTags.run(targetPost.tags),
			this.findPostTypeById.run(targetPost.postTypeId),
		]);

		const { tags: _1, postTypeId: _2, ...properties } = targetPost;

		return { ...properties, tags, postType };
	}
}
