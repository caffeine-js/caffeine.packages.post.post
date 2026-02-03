import { FindManyPostsUseCase } from "@/application/use-cases/find-many-posts.use-case";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeFindManyPostsUseCase(): FindManyPostsUseCase {
	return new FindManyPostsUseCase(
		makePostRepository(),
		new PostTypeRepository(),
		new PostTagRepository(),
	);
}
