import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import type { UpdatePostDTO } from "../dtos/update-post.dto";
import type { ICompletePost } from "../types/complete-post.interface";
import type { FindPostTagsService } from "../services/find-post-tags.service";
import {
	ResourceAlreadyExistsException,
	ResourceNotFoundException,
} from "@caffeine/errors/application";
import type { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { slugify } from "@caffeine/models/helpers";
import type { FindPostTypeByIdService } from "../services/find-post-type-by-id.service";
import { UnpackPost } from "@/domain/services";

export class UpdatePostBySlugUseCase {
	public constructor(
		private readonly repository: IPostRepository,
		private readonly findPostTags: FindPostTagsService,
		private readonly findPostTypeById: FindPostTypeByIdService,
		private readonly postUniquenessChecker: PostUniquenessChecker,
	) {}

	public async run(
		slug: string,
		{ cover, description, name, tags: _tags }: UpdatePostDTO,
	): Promise<ICompletePost> {
		const _targetPost = await this.repository.findBySlug(slug);

		if (!_targetPost) throw new ResourceNotFoundException("post@post");

		const targetPost = _targetPost;

		if (name && name !== targetPost.name) {
			const newSlug = slugify(name);

			if (newSlug !== targetPost.slug) {
				if (!(await this.postUniquenessChecker.run(newSlug)))
					throw new ResourceAlreadyExistsException(
						`post@post::slug->${newSlug}`,
					);
			}

			targetPost.rename(name);
		}

		if (description) targetPost.updateDescription(description);
		if (cover) targetPost.updateCover(cover);
		if (_tags) targetPost.updateTags(_tags);

		const tags = await this.findPostTags.run(targetPost.tags);

		await this.repository.update(targetPost);

		const { tags: _1, postTypeId, ...properties } = UnpackPost.run(targetPost);

		const postType = await this.findPostTypeById.run(postTypeId);

		return {
			...properties,
			tags,
			postType,
		};
	}
}
