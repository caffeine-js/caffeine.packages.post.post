import { makeFindPostByIdUseCase } from "@/infra/factories/application/use-cases/find-post-by-id.use-case.factory";
import { IdObjectDTO } from "@caffeine/models/dtos";
import { Elysia } from "elysia";

export const FindPostByIdController = new Elysia()
	.decorate("service", makeFindPostByIdUseCase())
	.get("/:id", ({ params: { id }, service }) => service.run(id), {
		params: IdObjectDTO,
		detail: {
			tags: ["Post"],
			summary: "Find post by ID",
			description: "Retrieves a single post by its unique UUID identifier.",
		},
	});
