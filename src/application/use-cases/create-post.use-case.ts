import type { IPostRepository } from "@/domain/types/post-repository.interface";
import type { CreatePostDTO } from "../dtos/create-post.dto";
import type { IUnmountedPost } from "@/domain/types";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { slugify } from "@caffeine/models/helpers";
import {
	ResourceAlreadyExistsException,
	ResourceNotFoundException,
} from "@caffeine/errors/application";
import { Post } from "@/domain/post";
import type { IPostTagRepository } from "@/domain/types/post-tag-repository.interface";
import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";

export class CreatePostUseCase {
	public constructor(
		private readonly postRepository: IPostRepository,
		private readonly postTagRepository: IPostTagRepository,
		private readonly postTypeRepository: IPostTypeRepository,
	) {}

	public async run(data: CreatePostDTO): Promise<IUnmountedPost> {
		const uniquenessChecker = new PostUniquenessChecker(this.postRepository);

		const slug = slugify(data.name);

		if (await uniquenessChecker.run(slug))
			throw new ResourceAlreadyExistsException("post@post");

		for (const tag of data.tags) {
			if (!(await this.postTagRepository.findById(tag)))
				throw new ResourceNotFoundException(`post@post::tags->${tag}`);
		}

		if (!(await this.postTypeRepository.findById(data.postTypeId)))
			throw new ResourceNotFoundException(
				`post@post::postType->${data.postTypeId}`,
			);

		const targetPost = Post.make({ ...data, slug });

		await this.postRepository.create(targetPost);

		return targetPost.unpack();
	}
}
