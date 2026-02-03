import { describe, expect, it, beforeEach } from "vitest";
import { UpdatePostBySlugUseCase } from "./update-post-by-slug.use-case";
import { PostRepository } from "@/infra/repositories/test/post.repository";
import { PostTagRepository } from "@/infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { Post } from "@/domain/post";
import {
	ResourceAlreadyExistsException,
	ResourceNotFoundException,
} from "@caffeine/errors/application";
import type { UpdatePostDTO } from "../dtos/update-post.dto";

describe("UpdatePostBySlugUseCase", () => {
	let useCase: UpdatePostBySlugUseCase;
	let postRepository: PostRepository;
	let postTagRepository: PostTagRepository;
	let postTypeRepository: PostTypeRepository;

	// IDs válidos (UUIDs) para passar na validação do schema
	const postTypeId = "550e8400-e29b-41d4-a716-446655440000";
	const tagId1 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
	const tagId2 = "7d444840-9dc0-11d1-b245-5ffdce74fad2";

	const mockPostType = {
		id: postTypeId,
		name: "Article",
		slug: "article",
		schema: "{}",
		isHighlighted: false,
		createdAt: new Date().toISOString(),
	};

	const mockTag1 = {
		id: tagId1,
		name: "Tech",
		slug: "tech",
		hidden: false,
		createdAt: new Date().toISOString(),
	};

	const mockTag2 = {
		id: tagId2,
		name: "News",
		slug: "news",
		hidden: false,
		createdAt: new Date().toISOString(),
	};

	const existingPost = Post.make({
		name: "Original Post",
		slug: "original-post",
		description: "Original description",
		cover: "https://example.com/original-cover.jpg",
		postTypeId: mockPostType.id,
		tags: [mockTag1.id],
	});

	beforeEach(async () => {
		postRepository = new PostRepository();
		postTagRepository = new PostTagRepository();
		postTypeRepository = new PostTypeRepository();

		postTypeRepository.seed([mockPostType]);
		postTagRepository.seed([mockTag1, mockTag2]);
		await postRepository.create(existingPost);

		useCase = new UpdatePostBySlugUseCase(
			postRepository,
			postTagRepository,
			postTypeRepository,
		);
	});

	it("should update basic fields successfully", async () => {
		const updateDto: UpdatePostDTO = {
			description: "Updated description",
			cover: "https://example.com/updated-cover.jpg",
		};

		const result = await useCase.run(existingPost.slug, updateDto);

		expect(result.description).toBe(updateDto.description!);
		expect(result.cover).toBe(updateDto.cover!);
		expect(result.name).toBe(existingPost.name); // Should remain unchanged

		// Verify persistence
		const persisted = await postRepository.findBySlug(existingPost.slug);
		expect(persisted?.description).toBe(updateDto.description!);
	});

	it("should update name and slug when name changes significantly", async () => {
		const updateDto: UpdatePostDTO = {
			name: "New Name For Post",
		};

		const result = await useCase.run(existingPost.slug, updateDto);

		expect(result.name).toBe("New Name For Post");
		expect(result.slug).toBe("new-name-for-post");

		// Verify old slug is gone and new one exists
		const oldSlugSearch = await postRepository.findBySlug(existingPost.slug);
		const newSlugSearch = await postRepository.findBySlug("new-name-for-post");

		expect(oldSlugSearch).toBeNull();
		expect(newSlugSearch).not.toBeNull();
		expect(newSlugSearch?.name).toBe("New Name For Post");
	});

	it("should update name but keep slug when change is only casing", async () => {
		// "Original Post" -> "original post" (slug remains "original-post")
		const updateDto: UpdatePostDTO = {
			name: "original post",
		};

		const result = await useCase.run(existingPost.slug, updateDto);

		expect(result.name).toBe("original post");
		expect(result.slug).toBe("original-post"); // Slug should not change

		const persisted = await postRepository.findBySlug("original-post");
		expect(persisted?.name).toBe("original post");
	});

	it("should update tags correctly", async () => {
		const updateDto: UpdatePostDTO = {
			tags: [mockTag2.id],
		};

		const result = await useCase.run(existingPost.slug, updateDto);

		expect(result.tags).toHaveLength(1);
		expect(result.tags[0]?.id).toBe(mockTag2.id);

		const persisted = await postRepository.findBySlug(existingPost.slug);
		expect(persisted?.tags).toEqual([mockTag2.id]);
	});

	it("should throw ResourceNotFoundException if post does not exist", async () => {
		const promise = useCase.run("non-existent-slug", {});

		await expect(promise).rejects.toThrow(ResourceNotFoundException);
	});

	it("should throw ResourceAlreadyExistsException if new name generates an existing slug", async () => {
		// Create another post first
		const anotherPost = Post.make({
			name: "Another Post",
			slug: "another-post",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: mockPostType.id,
			tags: [],
		});
		await postRepository.create(anotherPost);

		// Try to rename existingPost to "Another Post"
		const updateDto: UpdatePostDTO = {
			name: "Another Post",
		};

		const promise = useCase.run(existingPost.slug, updateDto);

		await expect(promise).rejects.toThrow(ResourceAlreadyExistsException);
	});

	it("should preserve existing tags if tags field is undefined in DTO", async () => {
		const updateDto: UpdatePostDTO = {
			description: "New desc",
		};

		const result = await useCase.run(existingPost.slug, updateDto);

		expect(result.tags).toHaveLength(1);
		expect(result.tags[0]?.id).toBe(mockTag1.id);
	});

	it("should not update 'updatedAt' if no updatable fields are provided", async () => {
		// Ensure enough time has passed so that if it WERE updated, the time would differ
		// or just check equality if we trust it won't be touched.
		// To be safe, we can mock the initial state with a specific past date if needed,
		// but since we are just checking if the logic branch runs, passing empty DTO is enough.

		const result = await useCase.run(existingPost.slug, {});

		// unpack existing to get its current updatedAt
		const existingUnpacked = existingPost.unpack();

		expect(result.updatedAt).toBe(existingUnpacked.updatedAt);
		expect(result.name).toBe(existingPost.name);
	});
});
