import { describe, it, expect, beforeEach } from "vitest";
import { CountPostsUseCase } from "./count-posts.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import { t } from "@caffeine/models";
import { Schema } from "@caffeine/models/schema";
import { makeEntityFactory } from "@caffeine/models/factories";
import { CreatePostUseCase } from "./create-post.use-case";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { PopulatePostService } from "../services/populate-post.service";
import { FindPostTagsService } from "../services/find-post-tags.service";
import { FindPostTypeByIdService } from "../services/find-post-type-by-id.service";
import { PaginationService } from "@/domain/services";

describe("CountPostsUseCase", () => {
	let useCase: CountPostsUseCase;
	let postRepository: PostRepository;
	let createPostUseCase: CreatePostUseCase;
	let postTypeRepository: PostTypeRepository;
	let postTagRepository: PostTagRepository;

	beforeEach(() => {
		postRepository = new PostRepository();
		postTypeRepository = new PostTypeRepository();
		postTagRepository = new PostTagRepository();

		createPostUseCase = new CreatePostUseCase(
			postRepository,
			new PostUniquenessChecker(postRepository),
			new PopulatePostService(
				new FindPostTagsService(postTagRepository),
				new FindPostTypeByIdService(postTypeRepository),
			),
		);

		useCase = new CountPostsUseCase(postRepository);
	});

	it("should count all posts and return pagination info", async () => {
		// Seed Type
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		await createPostUseCase.run({
			name: "Post 1",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		await createPostUseCase.run({
			name: "Post 2",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		const result = await useCase.run();

		expect(result).toEqual({
			count: 2,
			totalPages: PaginationService.run(2),
		});
	});

	it("should count posts by post type and return pagination info", async () => {
		// Seed Type 1
		const postType1: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		// Seed Type 2
		const postType2: IUnmountedPostType = {
			slug: "news",
			name: "News",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType1, postType2]);

		await createPostUseCase.run({
			name: "Post 1",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType1.id,
			tags: [],
		});

		await createPostUseCase.run({
			name: "Post 2",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType2.id,
			tags: [],
		});

		const resultType1 = await useCase.run(postType1.id);
		expect(resultType1).toEqual({
			count: 1,
			totalPages: PaginationService.run(1),
		});

		const resultType2 = await useCase.run(postType2.id);
		expect(resultType2).toEqual({
			count: 1,
			totalPages: PaginationService.run(1),
		});
	});

	it("should return count 0 and totalPages 0 when no posts exist", async () => {
		const result = await useCase.run();
		expect(result).toEqual({
			count: 0,
			totalPages: 0,
		});
	});
});
