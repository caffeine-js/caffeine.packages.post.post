import { describe, it, expect, beforeEach } from "vitest";
import { PopulatePostService } from "./populate-post.service";
import { FindPostTagsService } from "./find-post-tags.service";
import { FindPostTypeByIdService } from "./find-post-type-by-id.service";
import { PostTagRepository } from "@/infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { Post } from "@/domain/post";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { makeEntityFactory } from "@caffeine/models/factories";
import { generateUUID } from "@caffeine/models/helpers";
import { ResourceNotFoundException } from "@caffeine/errors/application";

describe("PopulatePostService", () => {
	let service: PopulatePostService;
	let postTagRepository: PostTagRepository;
	let postTypeRepository: PostTypeRepository;

	beforeEach(() => {
		postTagRepository = new PostTagRepository();
		postTypeRepository = new PostTypeRepository();

		const findPostTags = new FindPostTagsService(postTagRepository);
		const findPostTypeById = new FindPostTypeByIdService(postTypeRepository);

		service = new PopulatePostService(findPostTags, findPostTypeById);
	});

	it("should populate post with complete tags and post type", async () => {
		// Arrange
		const postTypeId = generateUUID();
		const postType: IUnmountedPostType = {
			...makeEntityFactory(),
			id: postTypeId,
			name: "Article",
			slug: "article",
			schema: "{}",
			isHighlighted: false,
		};
		postTypeRepository.seed([postType]);

		const tagId = generateUUID();
		const postTag: IUnmountedPostTag = {
			...makeEntityFactory(),
			id: tagId,
			name: "Tech",
			slug: "tech",
			hidden: false,
		};
		postTagRepository.seed([postTag]);

		const post = Post.make({
			name: "Test Post",
			description: "Test Description",
			cover: "https://example.com/cover.jpg",
			postTypeId: postTypeId,
			tags: [tagId],
		});

		// Act
		const result = await service.run(post);

		// Assert
		expect(result.id).toBe(post.id);
		expect(result.name).toBe(post.name);
		expect(result.postType.id).toBe(postTypeId);
		expect(result.postType.slug).toBe(postType.slug);
		expect(result.tags).toHaveLength(1);
		expect(result.tags[0]?.id).toBe(tagId);
		expect(result.tags[0]?.slug).toBe(postTag.slug);
	});

	it("should throw exception if post type is missing", async () => {
		// Arrange
		const post = Post.make({
			name: "Test Post",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: generateUUID(), // Non-existent
			tags: [],
		});

		// Act & Assert
		await expect(service.run(post)).rejects.toThrow(ResourceNotFoundException);
	});

	it("should throw exception if tag is missing", async () => {
		// Arrange
		const postTypeId = generateUUID();
		const postType: IUnmountedPostType = {
			...makeEntityFactory(),
			id: postTypeId,
			name: "Article",
			slug: "article",
			schema: "{}",
			isHighlighted: false,
		};
		postTypeRepository.seed([postType]);

		const post = Post.make({
			name: "Test Post",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postTypeId,
			tags: [generateUUID()], // Non-existent
		});

		// Act & Assert
		await expect(service.run(post)).rejects.toThrow(ResourceNotFoundException);
	});
});
