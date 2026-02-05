import { describe, it, expect, beforeEach } from "vitest";
import { FindManyPostsUseCase } from "./find-many-posts.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import { Post } from "../../domain/post";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import type { ICompletePost } from "../types/complete-post.interface";
import { makeEntityFactory } from "@caffeine/models/factories";
import { generateUUID } from "@caffeine/models/helpers";
import { ResourceNotFoundException } from "@caffeine/errors/application";

import { FindPostTagsService } from "../services/find-post-tags.service";
import { FindPostTypesService } from "../services/find-post-types.service";

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
			new FindPostTagsService(postTagRepository),
			new FindPostTypesService(postTypeRepository),
		);
	});

	it("should find many posts and hydrate them", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			schema: JSON.stringify({}),
			isHighlighted: false,
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const postTag: IUnmountedPostTag = {
			slug: "tech",
			name: "Tech",
			hidden: false,
			...makeEntityFactory(),
		};
		postTagRepository.seed([postTag]);

		for (let i = 0; i < 3; i++) {
			const post = Post.make({
				name: `Post ${i}`,
				description: "Desc",
				postTypeId: postType.id,
				tags: [postTag.id],
				cover: "https://example.com/cover.jpg",
			});
			await postRepository.create(post);
		}

		const result: ICompletePost[] = await useCase.run(1);

		expect(result).toHaveLength(3);
		expect(result[0]!.postType.id).toBe(postType.id);
		expect(result[0]!.tags[0]!.id).toBe(postTag.id);
	});

	it("should return empty array if no posts found", async () => {
		const result = await useCase.run(1);
		expect(result).toEqual([]);
	});

	it("should throw ResourceNotFoundException if post type is not found", async () => {
		const post = Post.make({
			name: "Post",
			description: "Desc",
			postTypeId: generateUUID(), // Non-existent type
			tags: [],
			cover: "https://example.com/cover.jpg",
		});

		// Create post with non-existent type
		await postRepository.create(post);

		await expect(useCase.run(1)).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});

	it("should throw ResourceNotFoundException if post tag is not found", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			schema: JSON.stringify({}),
			isHighlighted: false,
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const post = Post.make({
			name: "Post",
			description: "Desc",
			postTypeId: postType.id,
			tags: [generateUUID()], // Non-existent tag
			cover: "https://example.com/cover.jpg",
		});

		// Create post with non-existent tag
		await postRepository.create(post);

		await expect(useCase.run(1)).rejects.toThrow(
			`post@post::tags->${post.tags[0]}`,
		);
	});
});
