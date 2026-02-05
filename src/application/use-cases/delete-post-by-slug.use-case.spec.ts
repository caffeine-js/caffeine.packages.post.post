import { describe, it, expect, beforeEach } from "vitest";
import { DeletePostBySlugUseCase } from "./delete-post-by-slug.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { Post } from "../../domain/post";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import { generateUUID, slugify } from "@caffeine/models/helpers";

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
			description: "Desc",
			postTypeId: generateUUID(),
			tags: [],
			cover: "https://example.com/cover.jpg",
		});
		await repository.create(post);

		await useCase.run(slugify(post.name));

		const deletedPost = await repository.findBySlug("delete-me");
		expect(deletedPost).toBeNull();
	});

	it("should throw ResourceNotFoundException if post does not exist", async () => {
		await expect(useCase.run("non-existent-slug")).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
