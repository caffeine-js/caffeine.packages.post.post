import { CreatePostDTO } from "@/application/dtos/create-post.dto";
import { makeCreatePostUseCase } from "@/infra/factories/application/use-cases/create-post.use-case.factory";
import { AuthGuard } from "@caffeine/auth/plugins/guards";
import { Elysia } from "elysia";

export const CreatePostController = new Elysia()
	.use(AuthGuard({ layerName: "post@post" }))
	.decorate("service", makeCreatePostUseCase())
	.post("/", ({ body, service }) => service.run(body), {
		body: CreatePostDTO,
		detail: {
			tags: ["Post"],
			summary: "Create a new post",
			description:
				"Creates a new post with the provided metadata, tags, and type. Requires authentication.",
		},
	});
