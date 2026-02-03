import type { IPostRepository } from "@/domain/types/post-repository.interface";
import type { UpdatePostDTO } from "../dtos/update-post.dto";
import type { ICompletePost } from "../types/complete-post.interface";
import type { IPostTagRepository } from "@/domain/types/post-tag-repository.interface";
import { FindPostTagsService } from "../services/find-post-tags.service";
import {
	ResourceAlreadyExistsException,
	ResourceNotFoundException,
} from "@caffeine/errors/application";
import { BuildPost } from "@/domain/services/build-post.service";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { slugify } from "@caffeine/models/helpers";
import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import { FindPostTypeByIdService } from "../services/find-post-type-by-id.service";

export class UpdatePostBySlugUseCase {
	private readonly findPostTags: FindPostTagsService;
	private readonly findPostTypeById: FindPostTypeByIdService;
	private readonly postUniquenessChecker: PostUniquenessChecker;

	public constructor(
		private readonly repository: IPostRepository,
		private readonly postTagRepository: IPostTagRepository,
		private readonly postTypeRepository: IPostTypeRepository,
	) {
		this.findPostTags = new FindPostTagsService(postTagRepository);
		this.postUniquenessChecker = new PostUniquenessChecker(this.repository);
		this.findPostTypeById = new FindPostTypeByIdService(postTypeRepository);
	}

	public async run(
		slug: string,
		{ cover, description, name, tags: _tags }: UpdatePostDTO,
	): Promise<ICompletePost> {
		const _targetPost = await this.repository.findBySlug(slug);

		if (!_targetPost) throw new ResourceNotFoundException("post@post");

		const targetPost = BuildPost.run(_targetPost);

		if (cover || description || name || _tags)
			targetPost.updatedAt = new Date().toISOString();

		if (name && name !== targetPost.name) {
			const newSlug = slugify(name);

			if (newSlug !== targetPost.slug) {
				if (await this.postUniquenessChecker.run(newSlug))
					throw new ResourceAlreadyExistsException(
						`post@post::slug->${newSlug}`,
					);

				targetPost.slug = newSlug;
			}

			targetPost.name = name;
		}

		targetPost.description = description ?? targetPost.description;
		targetPost.cover = cover ?? targetPost.cover;
		targetPost.tags = _tags ?? targetPost.tags;

		const tags = await this.findPostTags.run(targetPost.tags);

		await this.repository.update(targetPost);

		const { tags: _1, postTypeId, ...properties } = targetPost.unpack();

		const postType = await this.findPostTypeById.run(postTypeId);

		return {
			...properties,
			tags,
			postType,
		};
	}
}
