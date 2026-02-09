import { Type, type Static } from "@sinclair/typebox";
import { UuidDTO } from "@caffeine/models/dtos/primitives";

export const SlugDTO = Type.String({
	pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
	description: "The unique slug identifier of the resource to query.",
	examples: ["my-cool-post"],
});

export const IdOrSlugDTO = Type.Object(
	{
		id: Type.Union([UuidDTO, SlugDTO], {
			description: "The unique identifier of the resource (UUID or Slug).",
			examples: ["550e8400-e29b-41d4-a716-446655440000", "my-cool-post"],
		}),
	},
	{
		description:
			"Query parameters for retrieving a resource by its UUID or slug.",
	},
);

export type IdOrSlugDTO = Static<typeof IdOrSlugDTO>;
