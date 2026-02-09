import { describe, it, expect, beforeEach } from "vitest";
import { DeletePostByIdUseCase } from "./delete-post-by-id.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { Post } from "../../domain/post";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import { generateUUID } from "@caffeine/models/helpers";

describe("DeletePostByIdUseCase", () => {
	let useCase: DeletePostByIdUseCase;
	let repository: PostRepository;

	beforeEach(() => {
		repository = new PostRepository();
		useCase = new DeletePostByIdUseCase(repository);
	});

	it("should delete a post by id", async () => {
		const post = Post.make({
			name: "Post to Delete",
			description: "Desc",
			postTypeId: generateUUID(),
			tags: [],
			cover: "https://example.com/cover.jpg",
		});
		await repository.create(post);

		await useCase.run(post.id);

		const deletedPost = await repository.findById(post.id);
		expect(deletedPost).toBeNull();
	});

	it("should throw ResourceNotFoundException if post does not exist", async () => {
		await expect(useCase.run(generateUUID())).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
