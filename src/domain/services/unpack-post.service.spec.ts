import { describe, expect, it } from "vitest";
import { generateUUID } from "@caffeine/models/helpers";
import { UnpackPost } from "./unpack-post.service";
import { Post } from "../post";

describe("UnpackPost", () => {
	it("should unpack a Post entity into a plain object", () => {
		const postProps = {
			postTypeId: generateUUID(),
			name: "Test Post",
			slug: "test-post",
			description: "Test Description",
			cover: "https://example.com/image.jpg",
			tags: [generateUUID()],
		};
		const entityProps = {
			id: generateUUID(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const post = Post.make(postProps, entityProps);
		const result = UnpackPost.run(post);

		expect(result).toEqual({
			...postProps,
			...entityProps,
		});
		expect(result).not.toBeInstanceOf(Post);
	});
});
