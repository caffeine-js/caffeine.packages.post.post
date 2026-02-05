import { describe, it, expect, beforeEach } from "vitest";
import { FindPostByIdUseCase } from "./find-post-by-id.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import { Post } from "../../domain/post";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { t } from "@caffeine/models";
import { makeEntityFactory } from "@caffeine/models/factories";
import { Schema } from "@caffeine/models/schema";

describe("FindPostByIdUseCase", () => {
	let useCase: FindPostByIdUseCase;
	let postRepository: PostRepository;
	let postTagRepository: PostTagRepository;
	let postTypeRepository: PostTypeRepository;

	beforeEach(() => {
		postRepository = new PostRepository();
		postTagRepository = new PostTagRepository();
		postTypeRepository = new PostTypeRepository();

		useCase = new FindPostByIdUseCase(
			postRepository,
			postTypeRepository, // Start with Type repo per constructor
			postTagRepository,
		);
	});

	it("should find and hydrate a post by id", async () => {
		// Seed Type
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		// Seed Tag
		const postTag: IUnmountedPostTag = {
			slug: "tech",
			name: "Tech",
			hidden: true,
			...makeEntityFactory(),
		};
		postTagRepository.seed([postTag]);

		const post = Post.make({
			name: "My Post",
			description: "Desc",
			postTypeId: postType.id,
			tags: [postTag.id],
			cover: "https://example.com/cover.jpg",
		});
		await postRepository.create(post);

		const result = await useCase.run(post.id);

		expect(result).toBeDefined();
		expect(result.id).toBe(post.id);
		expect(result.postType.id).toBe(postType.id);
		expect(result.tags).toHaveLength(1);
		expect(result.tags[0]?.id).toBe(postTag.id);
	});

	it("should throw ResourceNotFoundException if post not found", async () => {
		await expect(useCase.run("non-existent-id")).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
