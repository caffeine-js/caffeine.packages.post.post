import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";

import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { ICompletePost } from "../types/complete-post.interface";
import type { PopulatePostService } from "../services/populate-post.service";

export class FindPostByIdUseCase {
	public constructor(
		private readonly repository: IPostRepository,
		private readonly populatePost: PopulatePostService,
	) {}

	public async run(slug: string): Promise<ICompletePost> {
		const targetPost = await this.repository.findById(slug);

		if (!targetPost) throw new ResourceNotFoundException(`post@post`);

		return await this.populatePost.run(targetPost);
	}
}
