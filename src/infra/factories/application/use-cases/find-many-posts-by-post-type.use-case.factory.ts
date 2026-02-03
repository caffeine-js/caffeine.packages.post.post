import { FindManyPostsByPostTypeUseCase } from "@/application/use-cases/find-many-posts-by-post-type.use-case";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeFindManyPostsByPostTypeUseCase(): FindManyPostsByPostTypeUseCase {
	return new FindManyPostsByPostTypeUseCase(
		makePostRepository(),
		new PostTypeRepository(),
		new PostTagRepository(),
	);
}
