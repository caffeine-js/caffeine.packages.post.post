import { UpdatePostByIdUseCase } from "@/application/use-cases/update-post-by-id.use-case";
import { makePostRepository } from "../../repositories/post.repository.factory";
import { makePostTagRepository } from "../../repositories/post-tag.repository.factory";
import { makePostTypeRepository } from "../../repositories/post-type.repository.factory";

import { FindPostTagsService } from "@/application/services/find-post-tags.service";
import { FindPostTypeByIdService } from "@/application/services/find-post-type-by-id.service";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { PopulatePostService } from "@/application/services/populate-post.service";

export function makeUpdatePostByIdUseCase(): UpdatePostByIdUseCase {
	const postRepository = makePostRepository();
	const postTagRepository = makePostTagRepository();
	const postTypeRepository = makePostTypeRepository();

	const findPostTagsService = new FindPostTagsService(postTagRepository);
	const findPostTypeByIdService = new FindPostTypeByIdService(
		postTypeRepository,
	);

	return new UpdatePostByIdUseCase(
		postRepository,
		new PostUniquenessChecker(postRepository),
		new PopulatePostService(findPostTagsService, findPostTypeByIdService),
	);
}
