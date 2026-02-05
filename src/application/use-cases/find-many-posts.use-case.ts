import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import type { ICompletePost } from "../types/complete-post.interface";
import type { PopulateManyPostsService } from "../services/populate-many-posts.service";

export class FindManyPostsUseCase {
	public constructor(
		private readonly repository: IPostRepository,
		private readonly populateManyPosts: PopulateManyPostsService,
	) {}

	public async run(page: number): Promise<ICompletePost[]> {
		const posts = await this.repository.findMany(page);

		return await this.populateManyPosts.run(posts);
	}
}
