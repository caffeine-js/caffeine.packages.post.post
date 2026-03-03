import { describe, expect, it, beforeEach } from "bun:test";
import { FindPostUseCase } from "./find-post.use-case";
import { PostRepository } from "@/infra/repositories/test/post.repository";
import { FindEntityByTypeUseCase } from "@caffeine/application/use-cases";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import { Post } from "@/domain";
import type { IPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import type { IPostType } from "@caffeine-packages/post.post-type/domain/types";

const mockPostTag = (overrides?: Partial<IPostTag>): IPostTag =>
	({
		id: "tag-id",
		name: "Tech",
		slug: "tech",
		hidden: false,
		createdAt: new Date().toISOString(),
		rename() {},
		reslug() {},
		changeVisibility() {},
		...overrides,
	}) as IPostTag;

const mockPostType = (overrides?: Partial<IPostType>): IPostType =>
	({
		id: "type-id",
		name: "Blog",
		slug: "blog",
		isHighlighted: true,
		createdAt: new Date().toISOString(),
		rename() {},
		reslug() {},
		setHighlightTo() {},
		...overrides,
	}) as IPostType;

describe("FindPostUseCase", () => {
	let postRepository: PostRepository;
	let sut: FindPostUseCase;

	beforeEach(() => {
		postRepository = new PostRepository();
		const findEntityByType = new FindEntityByTypeUseCase(postRepository);
		sut = new FindPostUseCase(findEntityByType);
	});

	it("should find a post by id", async () => {
		const post = Post.make({
			name: "My Post",
			description: "Desc",
			cover: "https://example.com/img.jpg",
			type: mockPostType(),
			tags: [mockPostTag()],
		});
		await postRepository.create(post);

		const result = await sut.run(post.id);

		expect(result).toBe(post);
	});

	it("should find a post by slug", async () => {
		const post = Post.make({
			name: "My Post",
			description: "Desc",
			cover: "https://example.com/img.jpg",
			type: mockPostType(),
			tags: [mockPostTag()],
		});
		await postRepository.create(post);

		const result = await sut.run("my-post");

		expect(result).toBe(post);
	});

	it("should throw ResourceNotFoundException when post is not found by id", async () => {
		expect(
			sut.run("550e8400-e29b-41d4-a716-446655440000"),
		).rejects.toBeInstanceOf(ResourceNotFoundException);
	});

	it("should throw ResourceNotFoundException when post is not found by slug", async () => {
		expect(sut.run("non-existent-slug")).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});
});
