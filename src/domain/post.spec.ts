import { describe, expect, it } from "vitest";
import { Post } from "./post";
import { generateUUID } from "@caffeine/models/helpers";
import {
	InvalidDomainDataException,
	InvalidPropertyException,
} from "@caffeine/errors/domain";
import type { BuildPostDTO } from "./dtos/build-post.dto";

describe("Post Entity", () => {
	const validProps: BuildPostDTO = {
		name: "My First Post",
		description: "A description",
		slug: "my-first-post",
		cover: "https://example.com/image.jpg",
		postTypeId: generateUUID(),
		tags: [generateUUID()],
	};

	describe("make", () => {
		it("should create a valid instance with correct properties", () => {
			const post = Post.make(validProps);

			expect(post).toBeInstanceOf(Post);
			expect(post.name).toBe(validProps.name);
			expect(post.description).toBe(validProps.description);
			expect(post.slug).toBe(validProps.slug);
			expect(post.cover).toBe(validProps.cover);
			expect(post.postTypeId).toBe(validProps.postTypeId);
			expect(post.tags).toEqual(validProps.tags);
			expect(post.id).toBeDefined();
			expect(post.createdAt).toBeDefined();
		});

		it("should throw InvalidDomainDataException if props are invalid (invalid cover url)", () => {
			const invalidProps = { ...validProps, cover: "invalid-url" };
			expect(() => Post.make(invalidProps)).toThrow(InvalidDomainDataException);
		});

		it("should throw InvalidDomainDataException if props are invalid (invalid tag uuid)", () => {
			const invalidProps = { ...validProps, tags: ["invalid-uuid"] };
			expect(() => Post.make(invalidProps)).toThrow(InvalidDomainDataException);
		});
	});

	describe("rename", () => {
		it("should update name and re-generate slug", () => {
			const post = Post.make(validProps) as Post;
			const newName = "New Name For Post";
			const expectedSlug = "new-name-for-post";

			post.rename(newName);

			expect(post.name).toBe(newName);
			expect(post.slug).toBe(expectedSlug);
		});

		it("should throw InvalidPropertyException if name is invalid (empty)", () => {
			const post = Post.make(validProps) as Post;
			expect(() => post.rename("")).toThrow(InvalidPropertyException);
		});
	});

	describe("updateDescription", () => {
		it("should update description", () => {
			const post = Post.make(validProps) as Post;
			const newDescription = "New description content";

			post.updateDescription(newDescription);

			expect(post.description).toBe(newDescription);
		});

		it("should throw InvalidPropertyException if description is invalid (empty)", () => {
			const post = Post.make(validProps) as Post;
			expect(() => post.updateDescription("")).toThrow(
				InvalidPropertyException,
			);
		});
	});

	describe("updateCover", () => {
		it("should update cover", () => {
			const post = Post.make(validProps) as Post;
			const newCover = "https://example.com/new-cover.jpg";

			post.updateCover(newCover);

			expect(post.cover).toBe(newCover);
		});

		it("should throw InvalidPropertyException for invalid cover url", () => {
			const post = Post.make(validProps) as Post;
			expect(() => post.updateCover("invalid-url")).toThrow(
				InvalidPropertyException,
			);
		});
	});

	describe("updateTags", () => {
		it("should update tags", () => {
			const post = Post.make(validProps) as Post;
			const newTags = [generateUUID(), generateUUID()];

			post.updateTags(newTags);

			expect(post.tags).toEqual(newTags);
		});

		it("should throw InvalidPropertyException for invalid tag uuids", () => {
			const post = Post.make(validProps) as Post;
			expect(() => post.updateTags(["invalid-uuid"])).toThrow(
				InvalidPropertyException,
			);
		});
	});
});
