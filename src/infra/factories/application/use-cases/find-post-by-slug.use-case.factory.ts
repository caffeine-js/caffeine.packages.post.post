import { FindPostBySlugUseCase } from "@/application/use-cases/find-post-by-slug.use-case";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { makePostRepository } from "../../repositories/post.repository.factory";

import { FindPostTagsService } from "@/application/services/find-post-tags.service";
import { FindPostTypeByIdService } from "@/application/services/find-post-type-by-id.service";

export function makeFindPostBySlugUseCase(): FindPostBySlugUseCase {
	const postTagRepository = new PostTagRepository();
	const postTypeRepository = new PostTypeRepository();

	return new FindPostBySlugUseCase(
		makePostRepository(),
		new FindPostTagsService(postTagRepository),
		new FindPostTypeByIdService(postTypeRepository),
	);
}
