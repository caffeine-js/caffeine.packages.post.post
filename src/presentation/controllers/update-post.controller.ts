import { CompletePostDTO } from "@/application/dtos/complete-post.dto";
import { UpdatePostDTO } from "@/application/dtos/update-post.dto";
import { makeUpdatePostByIdUseCase } from "@/infra/factories/application/use-cases/update-post-by-id.use-case.factory";
import { makeUpdatePostBySlugUseCase } from "@/infra/factories/application/use-cases/update-post-by-slug.use-case.factory";
import { AuthGuard } from "@caffeine/auth/plugins/guards";
import { Elysia } from "elysia";
import { IdOrSlugDTO } from "../dtos/id-or-slug.dto";
import { Schema } from "@caffeine/models/schema";
import { UuidDTO } from "@caffeine/models/dtos/primitives";

export const UpdatePostController = new Elysia()
	.use(AuthGuard({ layerName: "post@post" }))
	.decorate("updatePostByIdService", makeUpdatePostByIdUseCase())
	.decorate("updatePostBySlugService", makeUpdatePostBySlugUseCase())
	.patch(
		"/:id",
		({
			params: { id },
			body,
			updatePostBySlugService,
			updatePostByIdService,
		}) => {
			if (Schema.make(UuidDTO).match(id))
				return updatePostByIdService.run(id, body);

			return updatePostBySlugService.run(id, body);
		},
		{
			params: IdOrSlugDTO,
			body: UpdatePostDTO,
			detail: {
				tags: ["Post"],
				summary: "Update post",
				description:
					"Updates an existing post resource. The post can be identified by either its unique UUID or its slug. Only provided fields will be updated. Authentication is required.",
			},
			response: CompletePostDTO,
		},
	);
