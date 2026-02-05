import { FindPostBySlugUseCase } from "@/application/use-cases/find-post-by-slug.use-case";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { makePostRepository } from "../../repositories/post.repository.factory";

import { FindPostTagsService } from "@/application/services/find-post-tags.service";
import { FindPostTypeByIdService } from "@/application/services/find-post-type-by-id.service";
import { PopulatePostService } from "@/application/services/populate-post.service";
export function makeFindPostBySlugUseCase(): FindPostBySlugUseCase {
	const postTagRepository = new PostTagRepository();
	const postTypeRepository = new PostTypeRepository();

	const findPostTagsService = new FindPostTagsService(postTagRepository);
	const findPostTypeByIdService = new FindPostTypeByIdService(
		postTypeRepository,
	);

	return new FindPostBySlugUseCase(
		makePostRepository(),
		new PopulatePostService(findPostTagsService, findPostTypeByIdService),
	);
}
