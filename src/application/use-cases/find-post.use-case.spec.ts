import { describe, it, expect, beforeEach } from "vitest";
import { FindPostUseCase } from "./find-post.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import { CreatePostUseCase } from "./create-post.use-case";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { PopulatePostService } from "../services/populate-post.service";
import { FindPostTagsService } from "../services/find-post-tags.service";
import { FindPostTypeByIdService } from "../services/find-post-type-by-id.service";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import { t } from "@caffeine/models";
import { Schema } from "@caffeine/models/schema";
import { makeEntityFactory } from "@caffeine/models/factories";

describe("FindPostUseCase", () => {
	let useCase: FindPostUseCase;
	let createPostUseCase: CreatePostUseCase;
	let postRepository: PostRepository;
	let postTypeRepository: PostTypeRepository;

	beforeEach(() => {
		postRepository = new PostRepository();
		postTypeRepository = new PostTypeRepository();
		const postTagRepository = new PostTagRepository();

		const populatePostService = new PopulatePostService(
			new FindPostTagsService(postTagRepository),
			new FindPostTypeByIdService(postTypeRepository),
		);

		createPostUseCase = new CreatePostUseCase(
			postRepository,
			new PostUniquenessChecker(postRepository),
			populatePostService,
		);

		useCase = new FindPostUseCase(postRepository, populatePostService);
	});

	it("should find and populate a post by UUID", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const created = await createPostUseCase.run({
			name: "Test Post",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		const found = await useCase.run(created.id);

		expect(found).toBeDefined();
		expect(found.id).toBe(created.id);
		expect(found.postType.id).toBe(postType.id);
	});

	it("should find and populate a post by slug", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const created = await createPostUseCase.run({
			name: "Test Post Two",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		const found = await useCase.run(created.slug);

		expect(found).toBeDefined();
		expect(found.id).toBe(created.id);
		expect(found.postType.id).toBe(postType.id);
	});

	it("should throw ResourceNotFoundException if not found", async () => {
		await expect(useCase.run("non-existent")).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
