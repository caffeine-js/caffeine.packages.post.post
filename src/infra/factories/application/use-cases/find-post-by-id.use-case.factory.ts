import { FindPostByIdUseCase } from "@/application/use-cases/find-post-by-id.use-case";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { FindPostTagsService } from "@/application/services/find-post-tags.service";
import { FindPostTypeByIdService } from "@/application/services/find-post-type-by-id.service";
import { PopulatePostService } from "@/application/services/populate-post.service";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeFindPostByIdUseCase(): FindPostByIdUseCase {
	const findPostTagsService = new FindPostTagsService(new PostTagRepository());
	const findPostTypeByIdService = new FindPostTypeByIdService(
		new PostTypeRepository(),
	);

	return new FindPostByIdUseCase(
		makePostRepository(),
		new PopulatePostService(findPostTagsService, findPostTypeByIdService),
	);
}
