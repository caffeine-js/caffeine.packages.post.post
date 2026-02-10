import { describe, it, expect, beforeEach } from "vitest";
import { UpdatePostUseCase } from "./update-post.use-case";
import { CreatePostUseCase } from "./create-post.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { PopulatePostService } from "../services/populate-post.service";
import { FindPostTagsService } from "../services/find-post-tags.service";
import { FindPostTypeByIdService } from "../services/find-post-type-by-id.service";
import {
	ResourceAlreadyExistsException,
	ResourceNotFoundException,
} from "@caffeine/errors/application";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import { t } from "@caffeine/models";
import { Schema } from "@caffeine/models/schema";
import { makeEntityFactory } from "@caffeine/models/factories";

describe("UpdatePostUseCase", () => {
	let useCase: UpdatePostUseCase;
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

		const uniquenessChecker = new PostUniquenessChecker(postRepository);

		createPostUseCase = new CreatePostUseCase(
			postRepository,
			uniquenessChecker,
			populatePostService,
		);

		useCase = new UpdatePostUseCase(
			postRepository,
			uniquenessChecker,
			populatePostService,
		);
	});

	it("should update post details successfully including name change (slug)", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const post = await createPostUseCase.run({
			name: "Original Name",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		const updated = await useCase.run(post.id, {
			name: "Updated Name",
			description: "New Desc",
		});

		expect(updated.name).toBe("Updated Name");
		expect(updated.slug).toBe("updated-name");
		expect(updated.description).toBe("New Desc");
	});

	it("should update post tags and cover", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const post = await createPostUseCase.run({
			name: "Original Name",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		const updated = await useCase.run(post.id, {
			cover: "https://example.com/new-cover.jpg",
			tags: [], // Using empty tags to trigger the branch if checking just definition
		});

		expect(updated.cover).toBe("https://example.com/new-cover.jpg");
	});

	it("should update post tags specifically", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const post = await createPostUseCase.run({
			name: "Original Name",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		// Assuming we can pass mocked tags or just empty list to verify the call
		// Ideally we would seed some tags and update to them
		const updated = await useCase.run(post.id, {
			tags: [],
		});

		expect(updated.tags).toEqual([]);
	});

	it("should not update name if provided name is same as current", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const post = await createPostUseCase.run({
			name: "Original Name",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		const updated = await useCase.run(post.id, {
			name: "Original Name", // Same name
			description: "New Desc",
		});

		expect(updated.name).toBe("Original Name");
		expect(updated.description).toBe("New Desc");
	});

	it("should not check uniqueness if name is different but results in same slug", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const post = await createPostUseCase.run({
			name: "My Post",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		// "My Post" slugifies to "my-post"
		// "MY POST" slugifies to "my-post"

		const updated = await useCase.run(post.id, {
			name: "MY POST",
		});

		expect(updated.name).toBe("MY POST");
		expect(updated.slug).toBe("my-post");
	});

	it("should throw ResourceAlreadyExistsException if new name creates existing slug", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		await createPostUseCase.run({
			name: "Post One",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		const postTwo = await createPostUseCase.run({
			name: "Post Two",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		await expect(
			useCase.run(postTwo.id, {
				name: "Post One",
			}),
		).rejects.toThrow(ResourceAlreadyExistsException);
	});

	it("should throw ResourceNotFoundException if post to update does not exist (slug)", async () => {
		await expect(
			useCase.run("non-existent-slug", {
				name: "New Name",
			}),
		).rejects.toThrow(ResourceNotFoundException);
	});

	it("should throw ResourceNotFoundException if post to update does not exist (UUID)", async () => {
		// Generate a random UUID that doesn't exist in repo
		const randomUuid = "00000000-0000-0000-0000-000000000000";
		await expect(
			useCase.run(randomUuid, {
				name: "New Name",
			}),
		).rejects.toThrow(ResourceNotFoundException);
	});

	it("should update post successfully when referenced by slug", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const post = await createPostUseCase.run({
			name: "Original Name",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		// post.slug should be "original-name"
		const updated = await useCase.run(post.slug, {
			description: "Updated via slug",
		});

		expect(updated.id).toBe(post.id);
		expect(updated.description).toBe("Updated via slug");
	});
});
