import { CompletePostDTO } from "@/application/dtos/complete-post.dto";
import { UpdatePostDTO } from "@/application/dtos/update-post.dto";
import { AuthGuard } from "@caffeine/auth/plugins/guards";
import { Elysia } from "elysia";
import { IdOrSlugDTO } from "../dtos/id-or-slug.dto";
import { makeUpdatePostUseCase } from "@/infra/factories/application/use-cases/update-post.use-case.factory";

export const UpdatePostController = new Elysia()
	.use(AuthGuard({ layerName: "post@post" }))
	.decorate("service", makeUpdatePostUseCase())
	.patch("/:id", ({ params: { id }, body, service }) => service.run(id, body), {
		params: IdOrSlugDTO,
		body: UpdatePostDTO,
		detail: {
			tags: ["Post"],
			summary: "Update post",
			description:
				"Updates an existing post resource. The post can be identified by either its unique UUID or its slug. Only provided fields will be updated. Authentication is required.",
		},
		response: CompletePostDTO,
	});
