import { DeletePostBySlugUseCase } from "@/application/use-cases/delete-post-by-slug.use-case";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeDeletePostBySlugUseCase(): DeletePostBySlugUseCase {
	return new DeletePostBySlugUseCase(makePostRepository());
}
