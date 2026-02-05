import { describe, expect, it } from "vitest";
import { generateUUID } from "@caffeine/models/helpers";
import { PostUniquenessChecker } from "./post-uniqueness-checker.service";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { Post } from "../post";

describe("PostUniquenessChecker", () => {
	// We strictly use the repository located in src/infra/repositories/test as per user instructions
	const repository = new PostRepository();
	const checker = new PostUniquenessChecker(repository);

	it("should return true if slug does not exist", async () => {
		const isUnique = await checker.run("non-existent-slug");
		expect(isUnique).toBe(true);
	});

	it("should return true if slug exists", async () => {
		const existingSlug = "existing-slug";
		const post = Post.make(
			{
				postTypeId: generateUUID(),
				name: "Existing Post",
				description: "Description",
				cover: "https://example.com/cover.png",
				tags: [],
			},
			{
				id: generateUUID(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		);

		await repository.create(post);

		const isUnique = await checker.run(existingSlug);
		expect(isUnique).toBe(true);
	});
});
