import { makeFindManyPostsByPostTypeUseCase } from "@/infra/factories/application/use-cases/find-many-posts-by-post-type.use-case.factory";
import { PaginationDTO } from "@caffeine/models/dtos";
import { Elysia, t } from "elysia";

export const FindManyPostsByPostTypeController = new Elysia()
	.decorate("service", makeFindManyPostsByPostTypeUseCase())
	.get(
		"/by-post-type/:postType",
		({ params: { postType }, query: { page }, service }) =>
			service.run({ postType, page }),
		{
			params: t.Object({
				postType: t.String({
					description: "The slug identifier of the post type.",
					examples: ["blog", "news"],
				}),
			}),
			query: PaginationDTO,
			detail: {
				tags: ["Post"],
				summary: "List posts by type",
				description:
					"Retrieves a paginated list of posts filtered by a specific post type.",
			},
		},
	);
