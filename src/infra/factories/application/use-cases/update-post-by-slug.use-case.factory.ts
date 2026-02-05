import { UpdatePostBySlugUseCase } from "@/application/use-cases/update-post-by-slug.use-case";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { makePostRepository } from "../../repositories/post.repository.factory";

import { FindPostTagsService } from "@/application/services/find-post-tags.service";
import { FindPostTypeByIdService } from "@/application/services/find-post-type-by-id.service";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";

export function makeUpdatePostBySlugUseCase(): UpdatePostBySlugUseCase {
	const postRepository = makePostRepository();
	const postTagRepository = new PostTagRepository();
	const postTypeRepository = new PostTypeRepository();

	return new UpdatePostBySlugUseCase(
		postRepository,
		new FindPostTagsService(postTagRepository),
		new FindPostTypeByIdService(postTypeRepository),
		new PostUniquenessChecker(postRepository),
	);
}
