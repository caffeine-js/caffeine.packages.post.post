import { makeGetPostNumberOfPagesUseCase } from "@/infra/factories/application/use-cases/get-post-number-of-pages.use-case.factory";
import { Elysia } from "elysia";

export const GetPostNumberOfPagesController = new Elysia()
	.decorate("service", makeGetPostNumberOfPagesUseCase())
	.get("/number-of-pages", ({ service }) => service.run(), {
		detail: {
			tags: ["Post"],
			summary: "Get total number of pages",
			description:
				"Calculates the total number of pages based on standard pagination settings.",
		},
	});
