import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import type { UpdatePostDTO } from "../dtos/update-post.dto";
import type { ICompletePost } from "../types/complete-post.interface";

import {
	ResourceAlreadyExistsException,
	ResourceNotFoundException,
} from "@caffeine/errors/application";
import type { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { slugify } from "@caffeine/models/helpers";
import type { PopulatePostService } from "../services/populate-post.service";

export class UpdatePostByIdUseCase {
	public constructor(
		private readonly repository: IPostRepository,
		private readonly postUniquenessChecker: PostUniquenessChecker,
		private readonly populatePost: PopulatePostService,
	) {}

	public async run(
		id: string,
		{ cover, description, name, tags: _tags }: UpdatePostDTO,
	): Promise<ICompletePost> {
		const _targetPost = await this.repository.findById(id);

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

		const completePost = await this.populatePost.run(targetPost);

		await this.repository.update(targetPost);

		return completePost;
	}
}
