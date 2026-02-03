import { FindPostByIdUseCase } from "@/application/use-cases/find-post-by-id.use-case";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeFindPostByIdUseCase(): FindPostByIdUseCase {
	return new FindPostByIdUseCase(
		makePostRepository(),
		new PostTypeRepository(),
		new PostTagRepository(),
	);
}
