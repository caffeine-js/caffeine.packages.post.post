import { FindPostUseCase } from "@/application/use-cases/find-post.use-case";
import { makePostRepository } from "../../repositories/post.repository.factory";
import { PopulatePostService } from "@/application/services/populate-post.service";
import { FindPostTagsService } from "@/application/services/find-post-tags.service";
import { makePostTagRepository } from "../../repositories/post-tag.repository.factory";
import { FindPostTypeByIdService } from "@/application/services/find-post-type-by-id.service";
import { makePostTypeRepository } from "../../repositories/post-type.repository.factory";

export function makeFindPostUseCase(): FindPostUseCase {
	const postTagRepository = makePostTagRepository();
	const postTypeRepository = makePostTypeRepository();

	return new FindPostUseCase(
		makePostRepository(),
		new PopulatePostService(
			new FindPostTagsService(postTagRepository),
			new FindPostTypeByIdService(postTypeRepository),
		),
	);
}
