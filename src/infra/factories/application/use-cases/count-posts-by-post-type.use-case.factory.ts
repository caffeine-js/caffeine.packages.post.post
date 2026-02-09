import { CountPostsByPostTypeUseCase } from "@/application/use-cases/count-posts-by-post-type.use-case";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeCountPostsByPostTypeUseCase(): CountPostsByPostTypeUseCase {
	return new CountPostsByPostTypeUseCase(makePostRepository());
}
