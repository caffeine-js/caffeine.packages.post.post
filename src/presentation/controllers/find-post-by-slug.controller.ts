import { makeFindPostBySlugUseCase } from "@/infra/factories/application/use-cases/find-post-by-slug.use-case.factory";
import { SlugObjectDTO } from "@caffeine/models/dtos";
import { Elysia } from "elysia";

export const FindPostBySlugController = new Elysia()
	.decorate("service", makeFindPostBySlugUseCase())
	.get("/by-slug/:slug", ({ params: { slug }, service }) => service.run(slug), {
		params: SlugObjectDTO,
		detail: {
			tags: ["Post"],
			summary: "Find post by slug",
			description:
				"Retrieves a single post using its URL-friendly slug identifier.",
		},
	});
