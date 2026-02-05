import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import type { ICompletePost } from "../types/complete-post.interface";
import type { PopulateManyPostsService } from "../services/populate-many-posts.service";
import type { FindPostTypeBySlugService } from "../services/find-post-type-by-slug.service";
import type { FindManyPostsByPostTypeDTO } from "../dtos/find-many-posts-by-post-type.dto";

export class FindManyPostsByPostTypeUseCase {
	public constructor(
		private readonly repository: IPostRepository,
		private readonly findPostTypeBySlug: FindPostTypeBySlugService,
		private readonly populateManyPosts: PopulateManyPostsService,
	) {}

	public async run({
		page,
		postType: _postType,
	}: FindManyPostsByPostTypeDTO): Promise<ICompletePost[]> {
		const postType = await this.findPostTypeBySlug.run(_postType);
		const posts = await this.repository.findManyByPostType(postType.id, page);

		// Note: We already have 'postType', but delegating to populateManyPosts ensures consistency
		// and centralized logic for hydration, even if it might re-fetch the type by ID.
		return await this.populateManyPosts.run(posts);
	}
}
