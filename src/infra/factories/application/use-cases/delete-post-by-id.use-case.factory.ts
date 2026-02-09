import { DeletePostByIdUseCase } from "@/application/use-cases/delete-post-by-id.use-case";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeDeletePostByIdUseCase(): DeletePostByIdUseCase {
	return new DeletePostByIdUseCase(makePostRepository());
}
