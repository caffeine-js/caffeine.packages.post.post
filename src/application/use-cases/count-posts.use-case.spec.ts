import { describe, it, expect, beforeEach } from "vitest";
import { CountPostsUseCase } from "./count-posts.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { Post } from "../../domain/post";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";

describe("CountPostsUseCase", () => {
	let useCase: CountPostsUseCase;
	let repository: IPostRepository;

	beforeEach(() => {
		repository = new PostRepository();
		useCase = new CountPostsUseCase(repository);
	});

	it("should return 0 when repository is empty", async () => {
		const count = await useCase.run();
		expect(count).toBe(0);
	});

	it("should return the correct number of posts", async () => {
		const post1 = Post.make({
			name: "Post 1",
			slug: "post-1",
			description: "Description 1",
			postTypeId: "550e8400-e29b-41d4-a716-446655440000",
			tags: [],
			cover: "https://example.com/cover.jpg",
		});
		const post2 = Post.make({
			name: "Post 2",
			slug: "post-2",
			description: "Description 2",
			postTypeId: "550e8400-e29b-41d4-a716-446655440000",
			tags: [],
			cover: "https://example.com/cover.jpg",
		});

		await repository.create(post1);
		await repository.create(post2);

		const count = await useCase.run();
		expect(count).toBe(2);
	});
});
