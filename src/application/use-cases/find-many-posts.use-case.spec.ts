import { describe, it, expect, beforeEach } from "vitest";
import { FindManyPostsUseCase } from "./find-many-posts.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import { Post } from "../../domain/post";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import type { ICompletePost } from "../types/complete-post.interface";

describe("FindManyPostsUseCase", () => {
	let useCase: FindManyPostsUseCase;
	let postRepository: PostRepository;
	let postTagRepository: PostTagRepository;
	let postTypeRepository: PostTypeRepository;

	beforeEach(() => {
		postRepository = new PostRepository();
		postTagRepository = new PostTagRepository();
		postTypeRepository = new PostTypeRepository();

		useCase = new FindManyPostsUseCase(
			postRepository,
			postTypeRepository,
			postTagRepository,
		);
	});

	it("should find many posts and hydrate them", async () => {
		const postType: IUnmountedPostType = {
			id: "550e8400-e29b-41d4-a716-446655440001",
			slug: "blog",
			name: "Blog",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			schema: JSON.stringify({}),
			isHighlighted: false,
		};
		postTypeRepository.seed([postType]);

		const postTag: IUnmountedPostTag = {
			id: "550e8400-e29b-41d4-a716-446655440002",
			slug: "tech",
			name: "Tech",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			hidden: false,
		};
		postTagRepository.seed([postTag]);

		for (let i = 0; i < 3; i++) {
			const post = Post.make({
				name: `Post ${i}`,
				slug: `post-${i}`,
				description: "Desc",
				postTypeId: "550e8400-e29b-41d4-a716-446655440001",
				tags: ["550e8400-e29b-41d4-a716-446655440002"],
				cover: "https://example.com/cover.jpg",
			});
			await postRepository.create(post);
		}

		const result: ICompletePost[] = await useCase.run(1);

		expect(result).toHaveLength(3);
		expect(result[0]!.postType.id).toBe("550e8400-e29b-41d4-a716-446655440001");
		expect(result[0]!.tags[0]!.id).toBe("550e8400-e29b-41d4-a716-446655440002");
	});

	it("should return empty array if no posts found", async () => {
		const result = await useCase.run(1);
		expect(result).toEqual([]);
	});

	it("should throw ResourceNotFoundException if post type is not found", async () => {
		// Create post with non-existent type
		await postRepository.create(
			Post.make({
				name: "Post",
				slug: "post",
				description: "Desc",
				postTypeId: "550e8400-e29b-41d4-a716-446655449999", // Non-existent type
				tags: [],
				cover: "https://example.com/cover.jpg",
			}),
		);

		await expect(useCase.run(1)).rejects.toThrow(
			"post@post::postType->550e8400-e29b-41d4-a716-446655449999",
		);
	});

	it("should throw ResourceNotFoundException if post tag is not found", async () => {
		const postType: IUnmountedPostType = {
			id: "550e8400-e29b-41d4-a716-446655440001",
			slug: "blog",
			name: "Blog",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			schema: JSON.stringify({}),
			isHighlighted: false,
		};
		postTypeRepository.seed([postType]);

		// Create post with non-existent tag
		await postRepository.create(
			Post.make({
				name: "Post",
				slug: "post",
				description: "Desc",
				postTypeId: "550e8400-e29b-41d4-a716-446655440001",
				tags: ["550e8400-e29b-41d4-a716-446655449999"], // Non-existent tag
				cover: "https://example.com/cover.jpg",
			}),
		);

		await expect(useCase.run(1)).rejects.toThrow(
			"post@post::tags->550e8400-e29b-41d4-a716-446655449999",
		);
	});
});
