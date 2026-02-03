import { makeDeletePostBySlugUseCase } from "@/infra/factories/application/use-cases/delete-post-by-slug.use-case.factory";
import { AuthGuard } from "@caffeine/auth/plugins/guards";
import { SlugObjectDTO } from "@caffeine/models/dtos";
import { Elysia } from "elysia";

export const DeletePostBySlugController = new Elysia()
	.use(AuthGuard({ layerName: "post@post" }))
	.decorate("service", makeDeletePostBySlugUseCase())
	.delete(
		"/by-slug/:slug",
		({ params: { slug }, service }) => service.run(slug),
		{
			params: SlugObjectDTO,
			detail: {
				tags: ["Post"],
				summary: "Delete post by slug",
				description:
					"Permanently removes a post identified by its slug. Requires authentication.",
			},
		},
	);
