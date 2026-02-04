import { t } from "@caffeine/models";
import { UnmountedPostTypeDTO } from "@caffeine-packages/post.post-type/domain/dtos";
import { UnmountedPostTagDTO } from "@caffeine-packages/post.post-tag/domain/dtos";

export const CompletePostDTO = t.Object(
	{
		postType: UnmountedPostTypeDTO,
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
			format: "url",
		}),
		tags: t.Array(UnmountedPostTagDTO),
	},
	{
		description:
			"Data transfer object representing a complete post with hydrated relationships, including post type and tags.",
	},
);

export type CompletePostDTO = t.Static<typeof CompletePostDTO>;
