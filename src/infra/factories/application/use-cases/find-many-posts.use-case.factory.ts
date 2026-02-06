import { FindManyPostsUseCase } from "@/application/use-cases/find-many-posts.use-case";
import { makePostRepository } from "../../repositories/post.repository.factory";
import { makePostTagRepository } from "../../repositories/post-tag.repository.factory";
import { makePostTypeRepository } from "../../repositories/post-type.repository.factory";

import { FindPostTagsService } from "@/application/services/find-post-tags.service";
import { FindPostTypesService } from "@/application/services/find-post-types.service";
import { PopulateManyPostsService } from "@/application/services/populate-many-posts.service";
export function makeFindManyPostsUseCase(): FindManyPostsUseCase {
	const postTagRepository = makePostTagRepository();
	const postTypeRepository = makePostTypeRepository();

	const findPostTagsService = new FindPostTagsService(postTagRepository);
	const findPostTypesService = new FindPostTypesService(postTypeRepository);

	return new FindManyPostsUseCase(
		makePostRepository(),
		new PopulateManyPostsService(findPostTagsService, findPostTypesService),
	);
}
