import { CompletePostDTO } from "@/application/dtos/complete-post.dto";
import { CreatePostDTO } from "@/application/dtos/create-post.dto";
import { makeCreatePostUseCase } from "@/infra/factories/application/use-cases/create-post.use-case.factory";
import { AuthGuard } from "@caffeine/auth/plugins/guards";
import { Elysia, status } from "elysia";

export const CreatePostController = new Elysia()
	.use(AuthGuard({ layerName: "post@post" }))
	.decorate("service", makeCreatePostUseCase())
	.post(
		"/",
		async ({ body, service }) => status(201, await service.run(body)),
		{
			body: CreatePostDTO,
			detail: {
				tags: ["Post"],
				summary: "Create a new post",
				description:
					"Creates a new post resource. The request body must include the post type and necessary metadata. Authentication is required.",
			},
			response: {
				201: CompletePostDTO,
			},
		},
	);
