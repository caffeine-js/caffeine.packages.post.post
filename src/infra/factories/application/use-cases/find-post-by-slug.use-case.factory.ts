import { FindPostBySlugUseCase } from "@/application/use-cases/find-post-by-slug.use-case";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";
import { makePostRepository } from "../../repositories/post.repository.factory";

export function makeFindPostBySlugUseCase(): FindPostBySlugUseCase {
	return new FindPostBySlugUseCase(
		makePostRepository(),
		new PostTypeRepository(),
		new PostTagRepository(),
	);
}
