import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { ICompletePost } from "../types/complete-post.interface";
import type { FindPostTypeByIdService } from "../services/find-post-type-by-id.service";
import type { FindPostTagsService } from "../services/find-post-tags.service";
import { UnpackPost } from "@/domain/services";

export class FindPostBySlugUseCase {
	public constructor(
		private readonly repository: IPostRepository,
		private readonly findPostTags: FindPostTagsService,
		private readonly findPostTypeById: FindPostTypeByIdService,
	) {}

	public async run(slug: string): Promise<ICompletePost> {
		const targetPost = await this.repository.findBySlug(slug);

		if (!targetPost) throw new ResourceNotFoundException(`post@post`);

		const [tags, postType] = await Promise.all([
			this.findPostTags.run(targetPost.tags),
			this.findPostTypeById.run(targetPost.postTypeId),
		]);

		const {
			tags: _1,
			postTypeId: _2,
			...properties
		} = UnpackPost.run(targetPost);

		return { ...properties, tags, postType };
	}
}
