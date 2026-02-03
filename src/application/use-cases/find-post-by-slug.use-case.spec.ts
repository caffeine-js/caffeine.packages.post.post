import { describe, it, expect, beforeEach } from "vitest";
import { FindPostBySlugUseCase } from "./find-post-by-slug.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import { Post } from "../../domain/post";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { Schema, t } from "@caffeine/models";

describe("FindPostBySlugUseCase", () => {
	let useCase: FindPostBySlugUseCase;
	let postRepository: PostRepository;
	let postTagRepository: PostTagRepository;
	let postTypeRepository: PostTypeRepository;

	beforeEach(() => {
		postRepository = new PostRepository();
		postTagRepository = new PostTagRepository();
		postTypeRepository = new PostTypeRepository();

		useCase = new FindPostBySlugUseCase(
			postRepository,
			postTypeRepository,
			postTagRepository,
		);
	});

	it("should find and hydrate a post by slug", async () => {
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

		const postTag: IUnmountedPostTag = {
			id: "550e8400-e29b-41d4-a716-446655440002",
			slug: "tech",
			name: "Tech",
			hidden: true,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		postTagRepository.seed([postTag]);

		const post = Post.make({
			name: "My Post",
			slug: "my-post",
			description: "Desc",
			postTypeId: "550e8400-e29b-41d4-a716-446655440001",
			tags: ["550e8400-e29b-41d4-a716-446655440002"],
			cover: "https://example.com/cover.jpg",
		});
		await postRepository.create(post);

		const result = await useCase.run("my-post");

		expect(result).toBeDefined();
		expect(result.slug).toBe("my-post");
		expect(result.postType.slug).toBe("blog");
		expect(result.tags[0]?.slug).toBe("tech");
	});

	it("should throw ResourceNotFoundException if post not found", async () => {
		await expect(useCase.run("non-existent-slug")).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
