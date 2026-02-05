import { FindManyPostsUseCase } from "@/application/use-cases/find-many-posts.use-case";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { makePostRepository } from "../../repositories/post.repository.factory";

import { FindPostTagsService } from "@/application/services/find-post-tags.service";
import { FindPostTypesService } from "@/application/services/find-post-types.service";

export function makeFindManyPostsUseCase(): FindManyPostsUseCase {
	const postTagRepository = new PostTagRepository();
	const postTypeRepository = new PostTypeRepository();

	return new FindManyPostsUseCase(
		makePostRepository(),
		new FindPostTagsService(postTagRepository),
		new FindPostTypesService(postTypeRepository),
	);
}
