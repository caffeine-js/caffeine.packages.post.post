import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { ICompletePost } from "../types/complete-post.interface";
import type { PopulatePostService } from "../services/populate-post.service";
import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";

export class FindPostByIdUseCase {
	public constructor(
		private readonly repository: IPostReader,
		private readonly populatePost: PopulatePostService,
	) {}

	public async run(slug: string): Promise<ICompletePost> {
		const targetPost = await this.repository.findById(slug);

		if (!targetPost) throw new ResourceNotFoundException(`post@post`);

		return await this.populatePost.run(targetPost);
	}
}
