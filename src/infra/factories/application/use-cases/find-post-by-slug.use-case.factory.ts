import { FindPostBySlugUseCase } from "@/application/use-cases/find-post-by-slug.use-case";
import { makePostRepository } from "../../repositories/post.repository.factory";
import { makePostTagRepository } from "../../repositories/post-tag.repository.factory";
import { makePostTypeRepository } from "../../repositories/post-type.repository.factory";

import { FindPostTagsService } from "@/application/services/find-post-tags.service";
import { FindPostTypeByIdService } from "@/application/services/find-post-type-by-id.service";
import { PopulatePostService } from "@/application/services/populate-post.service";
export function makeFindPostBySlugUseCase(): FindPostBySlugUseCase {
	const postTagRepository = makePostTagRepository();
	const postTypeRepository = makePostTypeRepository();

	const findPostTagsService = new FindPostTagsService(postTagRepository);
	const findPostTypeByIdService = new FindPostTypeByIdService(
		postTypeRepository,
	);

	return new FindPostBySlugUseCase(
		makePostRepository(),
		new PopulatePostService(findPostTagsService, findPostTypeByIdService),
	);
}
