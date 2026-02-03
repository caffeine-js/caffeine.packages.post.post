import { UpdatePostDTO } from "@/application/dtos/update-post.dto";
import { makeUpdatePostBySlugUseCase } from "@/infra/factories/application/use-cases/update-post-by-slug.use-case.factory";
import { AuthGuard } from "@caffeine/auth/plugins/guards";
import { SlugObjectDTO } from "@caffeine/models/dtos";
import { Elysia } from "elysia";

export const UpdatePostBySlugController = new Elysia()
	.use(AuthGuard({ layerName: "post@post" }))
	.decorate("service", makeUpdatePostBySlugUseCase())
	.patch(
		"/by-slug/:slug",
		({ params: { slug }, body, service }) => service.run(slug, body),
		{
			params: SlugObjectDTO,
			body: UpdatePostDTO,
			detail: {
				tags: ["Post"],
				summary: "Update post by slug",
				description:
					"Partially updates a post explicitly identified by its slug. Requires authentication.",
			},
		},
	);
