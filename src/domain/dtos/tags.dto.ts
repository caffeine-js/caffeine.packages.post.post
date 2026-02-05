import { t } from "@caffeine/models";

export const TagsDTO = t.Array(
	t.String({
		format: "uuid",
	}),
	{
		description: "A list of tag IDs associated with the post.",
		examples: [
			[
				"550e8400-e29b-41d4-a716-446655440000",
				"6ba7b810-9dad-11d1-80b4-00c04fd430c8",
			],
		],
	},
);

export type TagsDTO = t.Static<typeof TagsDTO>;
