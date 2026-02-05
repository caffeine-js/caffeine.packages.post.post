import type { CreatePostDTO } from "../dtos/create-post.dto";
import type { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { slugify } from "@caffeine/models/helpers";
import { ResourceAlreadyExistsException } from "@caffeine/errors/application";
import { Post } from "@/domain/post";
import type { ICompletePost } from "../types/complete-post.interface";
import type { PopulatePostService } from "../services/populate-post.service";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";

export class CreatePostUseCase {
	public constructor(
		private readonly repository: IPostRepository,
		private readonly uniquenessChecker: PostUniquenessChecker,
		private readonly populatePost: PopulatePostService,
	) {}

	public async run(data: CreatePostDTO): Promise<ICompletePost> {
		if (!(await this.uniquenessChecker.run(slugify(data.name))))
			throw new ResourceAlreadyExistsException("post@post");

		const targetPost = Post.make(data);

		const completePost = await this.populatePost.run(targetPost);

		await this.repository.create(targetPost);

		return completePost;
	}
}
