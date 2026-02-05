import { FindManyPostsByPostTypeUseCase } from "@/application/use-cases/find-many-posts-by-post-type.use-case";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { FindPostTagsService } from "@/application/services/find-post-tags.service";
import { FindPostTypeBySlugService } from "@/application/services/find-post-type-by-slug.service";
import { FindPostTypesService } from "@/application/services/find-post-types.service";
import { PopulateManyPostsService } from "@/application/services/populate-many-posts.service";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeFindManyPostsByPostTypeUseCase(): FindManyPostsByPostTypeUseCase {
	const postTagRepository = new PostTagRepository();
	const postTypeRepository = new PostTypeRepository();

	const findPostTypesService = new FindPostTypesService(postTypeRepository);
	const findPostTagsService = new FindPostTagsService(postTagRepository);
	const findPostTypeBySlugService = new FindPostTypeBySlugService(
		postTypeRepository,
	);

	return new FindManyPostsByPostTypeUseCase(
		makePostRepository(),
		findPostTypeBySlugService,
		new PopulateManyPostsService(findPostTagsService, findPostTypesService),
	);
}
