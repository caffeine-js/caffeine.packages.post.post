import { describe, it, expect, beforeEach } from "vitest";
import { FindManyPostsUseCase } from "./find-many-posts.use-case";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import { CreatePostUseCase } from "./create-post.use-case";
import { FindPostTypeBySlugService } from "../services/find-post-type-by-slug.service";
import { PopulateManyPostsService } from "../services/populate-many-posts.service";
import { FindPostTagsService } from "../services/find-post-tags.service";
import { FindPostTypesService } from "../services/find-post-types.service";
import { PopulatePostService } from "../services/populate-post.service";
import { FindPostTypeByIdService } from "../services/find-post-type-by-id.service";
import { PostUniquenessChecker } from "@/domain/services/post-uniqueness-checker.service";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import { t } from "@caffeine/models";
import { Schema } from "@caffeine/models/schema";
import { makeEntityFactory } from "@caffeine/models/factories";

describe("FindManyPostsUseCase", () => {
	let useCase: FindManyPostsUseCase;
	let createPostUseCase: CreatePostUseCase;
	let postRepository: PostRepository;
	let postTypeRepository: PostTypeRepository;

	beforeEach(() => {
		postRepository = new PostRepository();
		postTypeRepository = new PostTypeRepository();
		const postTagRepository = new PostTagRepository();

		const findPostTagsService = new FindPostTagsService(postTagRepository);
		const findPostTypesService = new FindPostTypesService(postTypeRepository);

		createPostUseCase = new CreatePostUseCase(
			postRepository,
			new PostUniquenessChecker(postRepository),
			new PopulatePostService(
				findPostTagsService,
				new FindPostTypeByIdService(postTypeRepository),
			),
		);

		useCase = new FindManyPostsUseCase(
			postRepository,
			new FindPostTypeBySlugService(postTypeRepository),
			new PopulateManyPostsService(findPostTagsService, findPostTypesService),
		);
	});

	it("should find many posts without filtering", async () => {
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

		const result = await useCase.run({ page: 1 });
		expect(result).toHaveLength(2);
	});

	it("should filter posts by post type slug", async () => {
		const postType1: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			isHighlighted: true,
			schema: new Schema(t.Object({ name: t.String() })).toString(),
			...makeEntityFactory(),
		};
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

		const result = await useCase.run({ page: 1, postType: "blog" });
		expect(result).toHaveLength(1);
		expect(result[0]?.name).toBe("Post 1");
		expect(result[0]?.postType.slug).toBe("blog");
	});
});
