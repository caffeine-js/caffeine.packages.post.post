import { AuthGuard } from "@caffeine/auth/plugins/guards";
import { Elysia } from "elysia";
import { IdOrSlugDTO } from "../dtos/id-or-slug.dto";
import { makeDeletePostUseCase } from "@/infra/factories/application/use-cases/delete-post.use-case.factory";

export const DeletePostController = new Elysia()
	.use(AuthGuard({ layerName: "post@post" }))
	.decorate("service", makeDeletePostUseCase())
	.delete("/:id", ({ params: { id }, service }) => service.run(id), {
		params: IdOrSlugDTO,
		detail: {
			tags: ["Post"],
			summary: "Delete post",
			description:
				"Permanently removes a post resource. The post can be identified by either its unique UUID or its slug. Authentication is required.",
		},
	});
