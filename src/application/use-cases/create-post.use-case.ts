import type { CreatePostDTO } from "../dtos/create-post.dto";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { slugify } from "@caffeine/models/helpers";
import { ResourceAlreadyExistsException } from "@caffeine/errors/application";
import { Post } from "@/domain/post";
import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import type { IPostTypeRepository } from "@/domain/types/repositories/post-type-repository.interface";
import type { ICompletePost } from "../types/complete-post.interface";
import { FindPostTypeByIdService } from "../services/find-post-type-by-id.service";
import { FindPostTagsService } from "../services/find-post-tags.service";
import { UnpackPost } from "@/domain/services";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";

export class CreatePostUseCase {
	private readonly findPostTags: FindPostTagsService;
	private readonly findPostTypeById: FindPostTypeByIdService;

	public constructor(
		private readonly repository: IPostRepository,
		private readonly postTagRepository: IPostTagRepository,
		private readonly postTypeRepository: IPostTypeRepository,
	) {
		this.findPostTags = new FindPostTagsService(postTagRepository);
		this.findPostTypeById = new FindPostTypeByIdService(postTypeRepository);
	}

	public async run(data: CreatePostDTO): Promise<ICompletePost> {
		const uniquenessChecker = new PostUniquenessChecker(this.repository);

		if (!(await uniquenessChecker.run(slugify(data.name))))
			throw new ResourceAlreadyExistsException("post@post");

		const [tags, postType] = await Promise.all([
			this.findPostTags.run(data.tags),
			this.findPostTypeById.run(data.postTypeId),
		]);

		const targetPost = Post.make(data);

		await this.repository.create(targetPost);

		const {
			postTypeId: _1,
			tags: _2,
			...properties
		} = UnpackPost.run(targetPost);

		return { postType, tags, ...properties };
	}
}
