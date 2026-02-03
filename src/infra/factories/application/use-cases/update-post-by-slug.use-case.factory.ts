import { UpdatePostBySlugUseCase } from "@/application/use-cases/update-post-by-slug.use-case";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeUpdatePostBySlugUseCase(): UpdatePostBySlugUseCase {
	return new UpdatePostBySlugUseCase(
		makePostRepository(),
		new PostTagRepository(),
		new PostTypeRepository(),
	);
}
