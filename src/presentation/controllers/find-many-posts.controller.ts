import { PaginationDTO } from "@caffeine/models/dtos";
import { makeFindManyPostsUseCase } from "@/infra/factories/application/use-cases/find-many-posts.use-case.factory";
import { Elysia } from "elysia";

export const FindManyPostsController = new Elysia()
	.decorate("service", makeFindManyPostsUseCase())
	.get("/", ({ query: { page }, service }) => service.run(page), {
		query: PaginationDTO,
		detail: {
			tags: ["Post"],
			summary: "List all posts",
			description:
				"Retrieves a paginated list of all posts, ordered by creation date.",
		},
	});
