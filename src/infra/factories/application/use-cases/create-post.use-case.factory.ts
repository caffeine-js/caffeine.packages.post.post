import { CreatePostUseCase } from "@/application/use-cases/create-post.use-case";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeCreatePostUseCase(): CreatePostUseCase {
	return new CreatePostUseCase(
		makePostRepository(),
		new PostTagRepository(),
		new PostTypeRepository(),
	);
}
