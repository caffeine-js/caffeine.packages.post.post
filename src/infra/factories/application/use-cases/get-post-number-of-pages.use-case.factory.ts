import { GetPostNumberOfPagesUseCase } from "@/application/use-cases/get-post-number-of-pages.use-case";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeGetPostNumberOfPagesUseCase(): GetPostNumberOfPagesUseCase {
	return new GetPostNumberOfPagesUseCase(makePostRepository());
}
