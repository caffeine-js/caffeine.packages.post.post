import { describe, it, expect, beforeEach } from "vitest";
import { PopulateManyPostsService } from "./populate-many-posts.service";
import { FindPostTagsService } from "./find-post-tags.service";
import { FindPostTypesService } from "./find-post-types.service";
import { PostTagRepository } from "@/infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { Post } from "@/domain/post";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { makeEntityFactory } from "@caffeine/models/factories";
import { generateUUID } from "@caffeine/models/helpers";
import { ResourceNotFoundException } from "@caffeine/errors/application";

describe("PopulateManyPostsService", () => {
	let service: PopulateManyPostsService;
	let postTagRepository: PostTagRepository;
	let postTypeRepository: PostTypeRepository;

	beforeEach(() => {
		postTagRepository = new PostTagRepository();
		postTypeRepository = new PostTypeRepository();

		const findPostTags = new FindPostTagsService(postTagRepository);
		const findPostTypes = new FindPostTypesService(postTypeRepository);

		service = new PopulateManyPostsService(findPostTags, findPostTypes);
	});

	it("should populate multiple posts efficiently", async () => {
		// Arrange
		const postType1: IUnmountedPostType = {
			...makeEntityFactory(),
			id: generateUUID(),
			name: "Blog",
			slug: "blog",
			schema: "{}",
			isHighlighted: false,
		};
		const postType2: IUnmountedPostType = {
			...makeEntityFactory(),
			id: generateUUID(),
			name: "News",
			slug: "news",
			schema: "{}",
			isHighlighted: false,
		};
		postTypeRepository.seed([postType1, postType2]);

		const tag1: IUnmountedPostTag = {
			...makeEntityFactory(),
			id: generateUUID(),
			name: "Tech",
			slug: "tech",
			hidden: false,
		};
		const tag2: IUnmountedPostTag = {
			...makeEntityFactory(),
			id: generateUUID(),
			name: "Life",
			slug: "life",
			hidden: true,
		};
		postTagRepository.seed([tag1, tag2]);

		const post1 = Post.make({
			name: "Post 1",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType1.id,
			tags: [tag1.id, tag2.id],
		});

		const post2 = Post.make({
			name: "Post 2",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType2.id,
			tags: [tag1.id],
		});

		const post3 = Post.make({
			name: "Post 3",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType1.id, // Reusing type 1
			tags: [], // No tags
		});

		// Act
		const result = await service.run([post1, post2, post3]);

		// Assert
		expect(result).toHaveLength(3);

		// Check Post 1
		expect(result[0]!.id).toBe(post1.id);
		expect(result[0]!.postType.id).toBe(postType1.id);
		expect(result[0]!.tags).toHaveLength(2);
		expect(result[0]!.tags).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: tag1.id }),
				expect.objectContaining({ id: tag2.id }),
			]),
		);

		// Check Post 2
		expect(result[1]!.id).toBe(post2.id);
		expect(result[1]!.postType.id).toBe(postType2.id);
		expect(result[1]!.tags).toHaveLength(1);
		expect(result[1]!.tags[0]!.id).toBe(tag1.id);

		// Check Post 3
		expect(result[2]!.id).toBe(post3.id);
		expect(result[2]!.postType.id).toBe(postType1.id);
		expect(result[2]!.tags).toHaveLength(0);
	});

	it("should return empty array if input posts are empty", async () => {
		const result = await service.run([]);
		expect(result).toEqual([]);
	});

	it("should throw exception if a referenced post type is missing", async () => {
		const post = Post.make({
			name: "Post",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: generateUUID(), // Missing type
			tags: [],
		});

		await expect(service.run([post])).rejects.toThrow(
			ResourceNotFoundException,
		);
	});

	it("should throw exception if a referenced tag is missing", async () => {
		const postType: IUnmountedPostType = {
			...makeEntityFactory(),
			id: generateUUID(),
			name: "Blog",
			slug: "blog",
			schema: "{}",
			isHighlighted: false,
		};
		postTypeRepository.seed([postType]);

		const post = Post.make({
			name: "Post",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [generateUUID()], // Missing tag
		});

		await expect(service.run([post])).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
