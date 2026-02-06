import type { ICompletePost } from "../types/complete-post.interface";
import type { PopulateManyPostsService } from "../services/populate-many-posts.service";
import type { FindPostTypeBySlugService } from "../services/find-post-type-by-slug.service";
import type { FindManyPostsByPostTypeDTO } from "../dtos/find-many-posts-by-post-type.dto";
import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";

export class FindManyPostsByPostTypeUseCase {
	public constructor(
		private readonly repository: IPostReader,
		private readonly findPostTypeBySlug: FindPostTypeBySlugService,
		private readonly populateManyPosts: PopulateManyPostsService,
	) {}

	public async run({
		page,
		postType: _postType,
	}: FindManyPostsByPostTypeDTO): Promise<ICompletePost[]> {
		const postType = await this.findPostTypeBySlug.run(_postType);
		const posts = await this.repository.findManyByPostType(postType.id, page);

		return await this.populateManyPosts.run(posts);
	}
}
