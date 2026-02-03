import { CountPostsUseCase } from "@/application/use-cases/count-posts.use-case";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeCountPostsUseCase(): CountPostsUseCase {
	return new CountPostsUseCase(makePostRepository());
}
