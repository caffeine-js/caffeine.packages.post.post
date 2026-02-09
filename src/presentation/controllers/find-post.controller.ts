import { Elysia } from "elysia";
import { IdOrSlugDTO } from "../dtos/id-or-slug.dto";
import { CompletePostDTO } from "@/application/dtos/complete-post.dto";
import { makeFindPostUseCase } from "@/infra/factories/application/use-cases/find-post.use-case.factory";

export const FindPostController = new Elysia()
	.decorate("service", makeFindPostUseCase())
	.get("/:id", ({ params: { id }, service }) => service.run(id), {
		params: IdOrSlugDTO,
		detail: {
			tags: ["Post"],
			summary: "Find post by ID or Slug",
			description:
				"Retrieves a detailed view of a single post resource. The post can be identified by either its unique UUID or its slug.",
		},
		response: CompletePostDTO,
	});
