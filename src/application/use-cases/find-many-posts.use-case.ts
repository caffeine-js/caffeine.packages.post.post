import type { ICompletePost } from "../types/complete-post.interface";
import type { PopulateManyPostsService } from "../services/populate-many-posts.service";
import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";

export class FindManyPostsUseCase {
	public constructor(
		private readonly repository: IPostReader,
		private readonly populateManyPosts: PopulateManyPostsService,
	) {}

	public async run(page: number): Promise<ICompletePost[]> {
		const posts = await this.repository.findMany(page);

		return this.populateManyPosts.run(posts);
	}
}
