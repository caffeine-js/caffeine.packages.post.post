import { makeFindManyPostsUseCase } from "@/infra/factories/application/use-cases/find-many-posts.use-case.factory";
import { Elysia } from "elysia";
import { makeFindManyPostsByPostTypeUseCase } from "@/infra/factories/application/use-cases/find-many-posts-by-post-type.use-case.factory";
import { TypeAndPageObjectDTO } from "../dtos/type-and-page-object.dto";
import { FindPostsResponseDTO } from "../dtos/find-posts-response.dto";

export const FindPostsController = new Elysia()
	.decorate("findPostsService", makeFindManyPostsUseCase())
	.decorate("findPostByTypeService", makeFindManyPostsByPostTypeUseCase())
	.get(
		"/",
		({ query: { page, type }, findPostByTypeService, findPostsService }) => {
			if (!type) {
				return findPostsService.run(page ?? 1);
			}

			return findPostByTypeService.run({ page: page ?? 1, postType: type });
		},
		{
			query: TypeAndPageObjectDTO,
			detail: {
				tags: ["Post"],
				summary: "List all posts",
				description:
					"Retrieves a paginated list of posts. Supports optional filtering by post type using the 'type' query parameter. Results are ordered by creation date.",
			},
			response: FindPostsResponseDTO,
		},
	);
