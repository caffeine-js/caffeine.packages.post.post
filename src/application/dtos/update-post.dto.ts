import { t } from "@caffeine/models";

export const UpdatePostDTO = t.Object(
	{
		postTypeId: t.Optional(
			t.String({
				format: "uuid",
				description:
					"The unique identifier of the post type that categorizes this post.",
				examples: ["550e8400-e29b-41d4-a716-446655440000"],
			}),
		),
		tags: t.Optional(
			t.Array(t.String(), {
				description:
					"A list of tag slugs to associate with the post for categorization and filtering.",
				examples: [["typescript", "programming", "web-development"]],
			}),
		),
		name: t.Optional(
			t.String({
				description: "The title of the post that will be displayed to users.",
				examples: ["Getting Started with TypeScript", "My First Blog Post"],
				minLength: 1,
			}),
		),
		description: t.Optional(
			t.String({
				description:
					"A detailed description or summary of the post content that provides context to readers.",
				examples: [
					"This post covers the basics of TypeScript and how to get started with it.",
				],
			}),
		),
		cover: t.Optional(
			t.String({
				description:
					"The URL or path to the cover image that will be displayed as the post thumbnail.",
				examples: [
					"https://example.com/images/typescript-cover.jpg",
					"/uploads/covers/my-post-cover.png",
				],
				format: "uri",
			}),
		),
	},
	{
		description:
			"Data transfer object for updating an existing post. All fields are optional, allowing partial updates of post properties.",
	},
);

export type UpdatePostDTO = t.Static<typeof UpdatePostDTO>;
