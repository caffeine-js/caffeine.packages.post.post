import { describe, it, expect, beforeEach } from "vitest";
import { FindManyPostsByPostTypeUseCase } from "./find-many-posts-by-post-type.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import { Post } from "../../domain/post";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";

describe("FindManyPostsByPostTypeUseCase", () => {
	let useCase: FindManyPostsByPostTypeUseCase;
	let postRepository: PostRepository;
	let postTagRepository: PostTagRepository;
	let postTypeRepository: PostTypeRepository;

	beforeEach(() => {
		postRepository = new PostRepository();
		postTagRepository = new PostTagRepository();
		postTypeRepository = new PostTypeRepository();

		useCase = new FindManyPostsByPostTypeUseCase(
			postRepository,
			postTypeRepository,
			postTagRepository,
		);
	});

	it("should find posts by post type slug and hydrate them", async () => {
		const postType1: IUnmountedPostType = {
			id: "550e8400-e29b-41d4-a716-446655440001",
			slug: "blog",
			name: "Blog",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			schema: JSON.stringify({}),
			isHighlighted: false,
		};
		const postType2: IUnmountedPostType = {
			id: "550e8400-e29b-41d4-a716-446655440003",
			slug: "news",
			name: "News",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			schema: JSON.stringify({}),
			isHighlighted: false,
		};
		postTypeRepository.seed([postType1, postType2]);

		const postTag: IUnmountedPostTag = {
			id: "550e8400-e29b-41d4-a716-446655440002",
			slug: "tech",
			name: "Tech",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			hidden: false,
		};
		postTagRepository.seed([postTag]);

		// Create post for Blog
		await postRepository.create(
			Post.make({
				name: "Blog Post",
				slug: "blog-post",
				description: "Desc",
				postTypeId: "550e8400-e29b-41d4-a716-446655440001",
				tags: ["550e8400-e29b-41d4-a716-446655440002"],
				cover: "https://example.com/cover.jpg",
			}),
		);

		// Create post for News
		await postRepository.create(
			Post.make({
				name: "News Post",
				slug: "news-post",
				description: "Desc",
				postTypeId: "550e8400-e29b-41d4-a716-446655440003",
				tags: ["550e8400-e29b-41d4-a716-446655440002"],
				cover: "https://example.com/cover.jpg",
			}),
		);

		const result = await useCase.run({ page: 1, postType: "blog" });

		expect(result).toHaveLength(1);
		expect(result[0]!.slug).toBe("blog-post");
		expect(result[0]!.postType.slug).toBe("blog");
	});

	it("should return empty if no posts for type", async () => {
		const postType1: IUnmountedPostType = {
			id: "550e8400-e29b-41d4-a716-446655440001",
			slug: "blog",
			name: "Blog",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			schema: JSON.stringify({}),
			isHighlighted: false,
		};
		postTypeRepository.seed([postType1]);

		const result = await useCase.run({ page: 1, postType: "blog" });
		expect(result).toEqual([]);
	});

	it("should throw ResourceNotFoundException if post tag is not found", async () => {
		const postType1: IUnmountedPostType = {
			id: "550e8400-e29b-41d4-a716-446655440001",
			slug: "blog",
			name: "Blog",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			schema: JSON.stringify({}),
			isHighlighted: false,
		};
		postTypeRepository.seed([postType1]);

		// Create post with non-existent tag
		await postRepository.create(
			Post.make({
				name: "Blog Post",
				slug: "blog-post",
				description: "Desc",
				postTypeId: "550e8400-e29b-41d4-a716-446655440001",
				tags: ["550e8400-e29b-41d4-a716-446655449999"], // Non-existent tag
				cover: "https://example.com/cover.jpg",
			}),
		);

		await expect(useCase.run({ page: 1, postType: "blog" })).rejects.toThrow(
			"post@post::tags->550e8400-e29b-41d4-a716-446655449999",
		);
	});
});
