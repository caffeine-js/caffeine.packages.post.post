import { FindManyPostsByPostTypeUseCase } from "@/application/use-cases/find-many-posts-by-post-type.use-case";
import { makePostTagRepository } from "../../repositories/post-tag.repository.factory";
import { makePostTypeRepository } from "../../repositories/post-type.repository.factory";
import { FindPostTagsService } from "@/application/services/find-post-tags.service";
import { FindPostTypeBySlugService } from "@/application/services/find-post-type-by-slug.service";
import { FindPostTypesService } from "@/application/services/find-post-types.service";
import { PopulateManyPostsService } from "@/application/services/populate-many-posts.service";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeFindManyPostsByPostTypeUseCase(): FindManyPostsByPostTypeUseCase {
	const postTagRepository = makePostTagRepository();
	const postTypeRepository = makePostTypeRepository();

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
