import { describe, it, expect, beforeEach } from "vitest";
import { DeletePostBySlugUseCase } from "./delete-post-by-slug.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { Post } from "../../domain/post";
import { ResourceNotFoundException } from "@caffeine/errors/application";

describe("DeletePostBySlugUseCase", () => {
	let useCase: DeletePostBySlugUseCase;
	let repository: PostRepository;

	beforeEach(() => {
		repository = new PostRepository();
		useCase = new DeletePostBySlugUseCase(repository);
	});

	it("should delete a post by slug", async () => {
		const post = Post.make({
			name: "Post to Delete",
			slug: "delete-me",
			description: "Desc",
			postTypeId: "550e8400-e29b-41d4-a716-446655440001",
			tags: [],
			cover: "https://example.com/cover.jpg",
		});
		await repository.create(post);

		await useCase.run("delete-me");

		const deletedPost = await repository.findBySlug("delete-me");
		expect(deletedPost).toBeNull();
	});

	it("should throw ResourceNotFoundException if post does not exist", async () => {
		await expect(useCase.run("non-existent-slug")).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
