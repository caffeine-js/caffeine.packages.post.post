import { describe, it, expect, beforeEach } from "vitest";
import { DeletePostUseCase } from "./delete-post.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { CreatePostUseCase } from "./create-post.use-case";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { PopulatePostService } from "../services/populate-post.service";
import { FindPostTagsService } from "../services/find-post-tags.service";
import { FindPostTypeByIdService } from "../services/find-post-type-by-id.service";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import { t } from "@caffeine/models";
import { Schema } from "@caffeine/models/schema";
import { makeEntityFactory } from "@caffeine/models/factories";

describe("DeletePostUseCase", () => {
	let useCase: DeletePostUseCase;
	let postRepository: PostRepository;
	let createPostUseCase: CreatePostUseCase;
	let postTypeRepository: PostTypeRepository;

	beforeEach(() => {
		postRepository = new PostRepository();
		postTypeRepository = new PostTypeRepository();
		const postTagRepository = new PostTagRepository();

		createPostUseCase = new CreatePostUseCase(
			postRepository,
			new PostUniquenessChecker(postRepository),
			new PopulatePostService(
				new FindPostTagsService(postTagRepository),
				new FindPostTypeByIdService(postTypeRepository),
			),
		);

		useCase = new DeletePostUseCase(postRepository);
	});

	it("should delete a post by UUID", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const post = await createPostUseCase.run({
			name: "Post to delete",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		await useCase.run(post.id);

		const found = await postRepository.findById(post.id);
		expect(found).toBeNull();
	});

	it("should delete a post by slug", async () => {
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const post = await createPostUseCase.run({
			name: "Post to delete by slug",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		});

		await useCase.run(post.slug);

		const found = await postRepository.findById(post.id);
		expect(found).toBeNull();
	});

	it("should throw ResourceNotFoundException if post does not exist", async () => {
		await expect(useCase.run("non-existent-id")).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
