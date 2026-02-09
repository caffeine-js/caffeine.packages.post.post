import { makeFindPostByIdUseCase } from "@/infra/factories/application/use-cases/find-post-by-id.use-case.factory";
import { makeFindPostBySlugUseCase } from "@/infra/factories/application/use-cases/find-post-by-slug.use-case.factory";
import { UuidDTO } from "@caffeine/models/dtos/primitives";
import { Schema } from "@caffeine/models/schema";
import { Elysia } from "elysia";
import { IdOrSlugDTO } from "../dtos/id-or-slug.dto";
import { CompletePostDTO } from "@/application/dtos/complete-post.dto";

export const FindPostController = new Elysia()
	.decorate("findPostByIdService", makeFindPostByIdUseCase())
	.decorate("findPostBySlugService", makeFindPostBySlugUseCase())
	.get(
		"/:id",
		({ params: { id }, findPostByIdService, findPostBySlugService }) => {
			if (Schema.make(UuidDTO).match(id)) return findPostByIdService.run(id);

			return findPostBySlugService.run(id);
		},
		{
			params: IdOrSlugDTO,
			detail: {
				tags: ["Post"],
				summary: "Find post by ID or Slug",
				description:
					"Retrieves a detailed view of a single post resource. The post can be identified by either its unique UUID or its slug.",
			},
			response: CompletePostDTO,
		},
	);
