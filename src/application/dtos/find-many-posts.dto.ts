import { t } from "@caffeine/models";
import { PaginationDTO } from "@caffeine/models/dtos/api";

export const FindManyPostsDTO = t.Composite(
	[
		t.Object({
			postType: t.Optional(
				t.String({
					description:
						"The slug or identifier of the post type to filter posts by.",
					examples: ["blog", "news", "tutorials"],
				}),
			),
		}),
		PaginationDTO,
	],
	{
		description:
			"Data transfer object for retrieving multiple posts filtered by a specific post type, including pagination options.",
	},
);

export type FindManyPostsDTO = t.Static<typeof FindManyPostsDTO>;
