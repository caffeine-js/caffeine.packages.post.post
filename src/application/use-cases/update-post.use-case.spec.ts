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

	it("should throw ResourceNotFoundException if post to update does not exist", async () => {
		await expect(
			useCase.run("non-existent", {
				name: "New Name",
			}),
		).rejects.toThrow(ResourceNotFoundException);
	});
});
