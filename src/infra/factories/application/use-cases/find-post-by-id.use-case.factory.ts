import { FindPostByIdUseCase } from "@/application/use-cases/find-post-by-id.use-case";
import { makePostTagRepository } from "../../repositories/post-tag.repository.factory";
import { makePostTypeRepository } from "../../repositories/post-type.repository.factory";
import { FindPostTagsService } from "@/application/services/find-post-tags.service";
import { FindPostTypeByIdService } from "@/application/services/find-post-type-by-id.service";
import { PopulatePostService } from "@/application/services/populate-post.service";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeFindPostByIdUseCase(): FindPostByIdUseCase {
	const findPostTagsService = new FindPostTagsService(makePostTagRepository());
	const findPostTypeByIdService = new FindPostTypeByIdService(
		makePostTypeRepository(),
	);

	return new FindPostByIdUseCase(
		makePostRepository(),
		new PopulatePostService(findPostTagsService, findPostTypeByIdService),
	);
}
