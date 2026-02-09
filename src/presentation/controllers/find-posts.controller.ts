import { Elysia } from "elysia";
import { TypeAndPageObjectDTO } from "../dtos/type-and-page-object.dto";
import { FindPostsResponseDTO } from "../dtos/find-posts-response.dto";
import { makeFindManyPostsUseCase } from "@/infra/factories/application/use-cases/find-many-posts.use-case.factory";
import { makeCountPostsUseCase } from "@/infra/factories/application/use-cases/count-posts.use-case.factory";

export const FindPostsController = new Elysia()
	.derive(() => ({
		service: makeFindManyPostsUseCase(),
		countPosts: makeCountPostsUseCase(),
	}))
	.get(
		"/",
		async ({ query: { page, type }, service, countPosts, set }) => {
			const metadata = await countPosts.run(type);

			set.headers["X-Total-Count"] = String(metadata.count);
			set.headers["X-Total-Pages"] = String(metadata.totalPages);

			return service.run({ page: page ?? 1, postType: type });
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
