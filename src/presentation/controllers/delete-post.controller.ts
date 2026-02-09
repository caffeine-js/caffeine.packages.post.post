import { makeDeletePostByIdUseCase } from "@/infra/factories/application/use-cases/delete-post-by-id.use-case.factory";
import { makeDeletePostBySlugUseCase } from "@/infra/factories/application/use-cases/delete-post-by-slug.use-case.factory";
import { AuthGuard } from "@caffeine/auth/plugins/guards";
import { Elysia } from "elysia";
import { IdOrSlugDTO } from "../dtos/id-or-slug.dto";
import { Schema } from "@caffeine/models/schema";
import { UuidDTO } from "@caffeine/models/dtos/primitives";

export const DeletePostController = new Elysia()
	.use(AuthGuard({ layerName: "post@post" }))
	.decorate("deletePostByIdService", makeDeletePostByIdUseCase())
	.decorate("deletePostBySlugService", makeDeletePostBySlugUseCase())
	.delete(
		"/:id",
		({ params: { id }, deletePostBySlugService, deletePostByIdService }) => {
			if (Schema.make(UuidDTO).match(id)) return deletePostByIdService.run(id);

			return deletePostBySlugService.run(id);
		},
		{
			params: IdOrSlugDTO,
			detail: {
				tags: ["Post"],
				summary: "Delete post",
				description:
					"Permanently removes a post resource. The post can be identified by either its unique UUID or its slug. Authentication is required.",
			},
		},
	);
