import { makeCountPostsUseCase } from "@/infra/factories/application/use-cases/count-posts.use-case.factory";
import { Elysia } from "elysia";
import { TypeObjectDTO } from "../dtos/type-object.dto";
import { makeCountPostsByPostTypeUseCase } from "@/infra/factories/application/use-cases/count-posts-by-post-type.use-case.factory";
import { PaginationService } from "@/domain/services";

export const PostMetadataController = new Elysia()
	.decorate("countPostsService", makeCountPostsUseCase())
	.decorate("countPostsByPostTypeService", makeCountPostsByPostTypeUseCase())
	.head(
		"/",
		async ({
			countPostsByPostTypeService,
			countPostsService,
			query: { type },
			set,
		}) => {
			if (type) {
				const totalCount = await countPostsByPostTypeService.run(type);

				set.headers["X-Total-Count"] = String(totalCount);
				set.headers["X-Total-Pages"] = String(
					PaginationService.run(totalCount),
				);

				return;
			}

			const totalCount = await countPostsService.run();

			set.headers["X-Total-Count"] = String(totalCount);
			set.headers["X-Total-Pages"] = String(PaginationService.run(totalCount));
		},
		{
			detail: {
				tags: ["Post"],
				summary: "Get post metadata",
				description:
					"Retrieves metadata for the posts resource, such as total count and pagination information, via response headers ('X-Total-Count', 'X-Total-Pages'). Supports filtering by post type.",
			},
			query: TypeObjectDTO,
		},
	);
