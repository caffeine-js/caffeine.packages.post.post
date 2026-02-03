import { makeCountPostsUseCase } from "@/infra/factories/application/use-cases/count-posts.use-case.factory";
import { Elysia } from "elysia";

export const CountPostsController = new Elysia()
	.decorate("service", makeCountPostsUseCase())
	.get("/length", ({ service }) => service.run(), {
		detail: {
			tags: ["Post"],
			summary: "Get total number of posts",
			description: "Returns the total count of posts available in the system.",
		},
	});
