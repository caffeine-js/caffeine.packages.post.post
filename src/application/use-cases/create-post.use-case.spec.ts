import { describe, it, expect, beforeEach } from "vitest";
import { CreatePostUseCase } from "./create-post.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import { ResourceAlreadyExistsException } from "@caffeine/errors/application";
// Assuming interfaces for seeding
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { Schema, t } from "@caffeine/models";

describe("CreatePostUseCase", () => {
	let useCase: CreatePostUseCase;
	let postRepository: PostRepository;
	let postTagRepository: PostTagRepository;
	let postTypeRepository: PostTypeRepository;

	beforeEach(() => {
		postRepository = new PostRepository();
		postTagRepository = new PostTagRepository();
		postTypeRepository = new PostTypeRepository();

		useCase = new CreatePostUseCase(
			postRepository,
			postTagRepository,
			postTypeRepository,
		);
	});

	it("should create a new post successfully", async () => {
		// Seed Type
		const postType: IUnmountedPostType = {
			id: "550e8400-e29b-41d4-a716-446655440001",
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		postTypeRepository.seed([postType]);

		// Seed Tag
		const postTag: IUnmountedPostTag = {
			id: "550e8400-e29b-41d4-a716-446655440002",
			slug: "tech",
			name: "Tech",
			hidden: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		postTagRepository.seed([postTag]);

		const dto = {
			name: "My New Post",
			description: "A description",
			cover: "https://example.com/cover.jpg",
			postTypeId: "550e8400-e29b-41d4-a716-446655440001",
			tags: ["550e8400-e29b-41d4-a716-446655440002"],
		};

		const result = await useCase.run(dto);

		expect(result).toBeDefined();
		expect(result.name).toBe(dto.name);
		expect(result.slug).toBe("my-new-post"); // slugify assumes snake/kebab case usually
		expect(result.postType.id).toBe("550e8400-e29b-41d4-a716-446655440001");
		expect(result.tags).toHaveLength(1);
		expect(result.tags[0]?.id).toBe("550e8400-e29b-41d4-a716-446655440002");

		const savedPost = await postRepository.findBySlug("my-new-post");
		expect(savedPost).toBeDefined();
	});

	it("should throw ResourceAlreadyExistsException if slug already exists", async () => {
		// Seed Type
		const postType: IUnmountedPostType = {
			id: "550e8400-e29b-41d4-a716-446655440001",
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		postTypeRepository.seed([postType]);

		const dto = {
			name: "Duplicate Post",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: "550e8400-e29b-41d4-a716-446655440001",
			tags: [],
		};

		// Run once
		await useCase.run(dto);

		// Run again
		await expect(useCase.run(dto)).rejects.toThrow(
			ResourceAlreadyExistsException,
		);
	});
});
