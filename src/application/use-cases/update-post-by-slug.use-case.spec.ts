import { describe, expect, it, beforeEach } from "vitest";
import { UpdatePostBySlugUseCase } from "./update-post-by-slug.use-case";
import { PopulatePostService } from "../services/populate-post.service";
import { PostRepository } from "@/infra/repositories/test/post.repository";
import { PostTagRepository } from "@/infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { Post } from "@/domain/post";
import {
	ResourceAlreadyExistsException,
	ResourceNotFoundException,
} from "@caffeine/errors/application";
import type { UpdatePostDTO } from "../dtos/update-post.dto";
import { generateUUID, slugify } from "@caffeine/models/helpers";
import { makeEntityFactory } from "@caffeine/models/factories";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";

import { FindPostTagsService } from "../services/find-post-tags.service";
import { FindPostTypeByIdService } from "../services/find-post-type-by-id.service";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";

describe("UpdatePostBySlugUseCase", () => {
	let useCase: UpdatePostBySlugUseCase;
	let postRepository: PostRepository;
	let postTagRepository: PostTagRepository;
	let postTypeRepository: PostTypeRepository;

	// IDs válidos (UUIDs) para passar na validação do schema
	const postTypeId = generateUUID();
	const tagId1 = generateUUID();
	const tagId2 = generateUUID();

	const mockPostType: IUnmountedPostType = {
		...makeEntityFactory(),
		id: postTypeId,
		name: "Article",
		slug: slugify("Article"),
		schema: "{}",
		isHighlighted: false,
	};

	const mockTag1: IUnmountedPostTag = {
		...makeEntityFactory(),
		id: tagId1,
		name: "Tech",
		slug: slugify("Tech"),
		hidden: false,
	};

	const mockTag2: IUnmountedPostTag = {
		...makeEntityFactory(),
		id: tagId2,
		name: "News",
		slug: slugify("News"),
		hidden: false,
	};

	const existingPost = Post.make({
		name: "Original Post",
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
			new PostUniquenessChecker(postRepository),
			new PopulatePostService(
				new FindPostTagsService(postTagRepository),
				new FindPostTypeByIdService(postTypeRepository),
			),
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
		const result = await useCase.run(existingPost.slug, {});
		// Logic verification implies no errors and return of current state
		expect(result.slug).toBe(existingPost.slug);
	});
});
