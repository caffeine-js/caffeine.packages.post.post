import { t } from "@caffeine/models";

export const BuildPostDTO = t.Object(
	{
		postTypeId: t.String({
			format: "uuid",
			description: "The unique identifier of the post type.",
			examples: ["550e8400-e29b-41d4-a716-446655440000"],
		}),
		tags: t.Array(
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
		),
		name: t.String({
			description: "The name or title of the post.",
			examples: ["My First Post"],
			minLength: 1,
		}),
		slug: t.String({
			description:
				"The unique slug identifier derived from the name (e.g., 'my-first-post').",
			examples: ["my-first-post"],
		}),
		description: t.String({
			description: "A brief summary or description of the post content.",
			examples: ["This is a summary of the post content."],
		}),
		cover: t.String({
			description: "The URL or path to the cover image of the post.",
			examples: ["https://example.com/cover.jpg"],
			format: "uri",
		}),
	},
	{
		description: "Data transfer object used for building a post entity.",
	},
);

export type BuildPostDTO = t.Static<typeof BuildPostDTO>;
