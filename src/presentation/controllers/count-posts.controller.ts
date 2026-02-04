import { makeCountPostsUseCase } from "@/infra/factories/application/use-cases/count-posts.use-case.factory";
import { NumericResponseDTO } from "@caffeine/models/dtos/api";
import { Elysia, status } from "elysia";

export const CountPostsController = new Elysia()
	.decorate("service", makeCountPostsUseCase())
	.get("/length", async ({ service }) => status(200, await service.run()), {
		detail: {
			tags: ["Post"],
			summary: "Get total number of posts",
			description: "Returns the total count of posts available in the system.",
		},
		response: {
			200: NumericResponseDTO,
		},
	});
