import { describe, expect, it } from "vitest";

import { generateUUID } from "@caffeine/models/helpers";
import { InvalidDomainDataException } from "@caffeine/errors/domain";

import { BuildPost } from "./build-post.service";
import { Post } from "../post";
import type { IUnpackedPost } from "../types";

describe("BuildPost", () => {
	it("should build a post successfully with valid data", () => {
		const validData: IUnpackedPost = {
			id: generateUUID(),
			postTypeId: generateUUID(),
			name: "Valid Post Name",
			slug: "valid-post-name",
			description: "A valid description for the post.",
			cover: "https://example.com/cover.jpg",
			tags: [generateUUID(), generateUUID()],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const post = BuildPost.run(validData);

		expect(post).toBeInstanceOf(Post);
		expect(post.id).toBe(validData.id);
		expect(post.name).toBe(validData.name);
		expect(post.slug).toBe(validData.slug);
		expect(post.description).toBe(validData.description);
		expect(post.cover).toBe(validData.cover);
		expect(post.tags).toEqual(validData.tags);
	});

	it("should throw InvalidDomainDataException with invalid data", () => {
		const invalidData = {
			id: generateUUID(),
			// Missing postTypeId
			name: "Invalid Post",
			slug: "invalid-post",
			description: "Missing required fields",
			updatedAt: new Date().toISOString(),
		} as unknown as IUnpackedPost;

		expect(() => BuildPost.run(invalidData)).toThrow(
			InvalidDomainDataException,
		);
	});
});
