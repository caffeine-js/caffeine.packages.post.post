import { describe, it, expect, beforeEach } from "vitest";
import { CreatePostUseCase } from "./create-post.use-case";
import { FindPostTagsService } from "../services/find-post-tags.service";
import { PopulatePostService } from "../services/populate-post.service";
import { FindPostTypeByIdService } from "../services/find-post-type-by-id.service";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import { ResourceAlreadyExistsException } from "@caffeine/errors/application";
// Assuming interfaces for seeding
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { t } from "@caffeine/models";
import { Schema } from "@caffeine/models/schema";
import { makeEntityFactory } from "@caffeine/models/factories";
import type { CreatePostDTO } from "../dtos/create-post.dto";

describe("CreatePostUseCase", () => {
	let useCase: CreatePostUseCase;
	let postRepository: PostRepository;
	let postTagRepository: PostTagRepository;
	let postTypeRepository: PostTypeRepository;

	beforeEach(() => {
		postRepository = new PostRepository();
		postTagRepository = new PostTagRepository();
		postTypeRepository = new PostTypeRepository();

		useCase = new CreatePostUseCase(
			postRepository,
			new PostUniquenessChecker(postRepository),
			new PopulatePostService(
				new FindPostTagsService(postTagRepository),
				new FindPostTypeByIdService(postTypeRepository),
			),
		);
	});

	it("should create a new post successfully", async () => {
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
			hidden: false,
			...makeEntityFactory(),
		};
		postTagRepository.seed([postTag]);

		const dto = {
			name: "My New Post",
			description: "A description",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [postTag.id],
		};

		const result = await useCase.run(dto);

		expect(result).toBeDefined();
		expect(result.name).toBe(dto.name);
		expect(result.slug).toBe("my-new-post"); // slugify assumes snake/kebab case usually
		expect(result.postType.id).toBe(postType.id);
		expect(result.tags).toHaveLength(1);
		expect(result.tags[0]?.id).toBe(postTag.id);

		const savedPost = await postRepository.findBySlug("my-new-post");
		expect(savedPost).toBeDefined();
	});

	it("should throw ResourceAlreadyExistsException if slug already exists", async () => {
		// Seed Type
		const postType: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType]);

		const dto: CreatePostDTO = {
			name: "Duplicate Post",
			description: "Desc",
			cover: "https://example.com/cover.jpg",
			postTypeId: postType.id,
			tags: [],
		};

		// Run once
		await useCase.run(dto);

		// Run again
		await expect(useCase.run(dto)).rejects.toThrow(
			ResourceAlreadyExistsException,
		);
	});
});
