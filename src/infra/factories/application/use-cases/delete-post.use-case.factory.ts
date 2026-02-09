import { DeletePostUseCase } from "@/application/use-cases/delete-post.use-case";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeDeletePostUseCase(): DeletePostUseCase {
	return new DeletePostUseCase(makePostRepository());
}
