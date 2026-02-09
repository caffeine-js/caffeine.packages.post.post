import { describe, it, expect } from "vitest";
import { CountPostsByPostTypeUseCase } from "./count-posts-by-post-type.use-case";
import { PostRepository } from "@/infra/repositories/test/post.repository";
import { generateUUID } from "@caffeine/models/helpers";
import { Post } from "@/domain";
import { makeEntityFactory } from "@caffeine/models/factories";

describe("CountPostsByPostTypeUseCase", () => {
	it("should return the number of posts of the specified type", async () => {
		const repository = new PostRepository();
		const type1 = generateUUID();
		const type2 = generateUUID();

		const post1 = Post.make(
			{
				name: "Post 1",
				description: "Desc",
				postTypeId: type1,
				tags: [],
				cover: "https://example.com/cover.jpg",
			},
			makeEntityFactory(),
		);

		const post2 = Post.make(
			{
				name: "Post 2",
				description: "Desc",
				postTypeId: type1,
				tags: [],
				cover: "https://example.com/cover.jpg",
			},
			makeEntityFactory(),
		);

		const post3 = Post.make(
			{
				name: "Post 3",
				description: "Desc",
				postTypeId: type2,
				tags: [],
				cover: "https://example.com/cover.jpg",
			},
			makeEntityFactory(),
		);

		await repository.create(post1);
		await repository.create(post2);
		await repository.create(post3);

		const useCase = new CountPostsByPostTypeUseCase(repository);

		expect(await useCase.run(type1)).toBe(2);
		expect(await useCase.run(type2)).toBe(1);
	});

	it("should return 0 if there are no posts of the type", async () => {
		const repository = new PostRepository();
		const useCase = new CountPostsByPostTypeUseCase(repository);

		expect(await useCase.run(generateUUID())).toBe(0);
	});
});
