import { describe, it, expect, beforeEach } from "vitest";
import { FindManyPostsByPostTypeUseCase } from "./find-many-posts-by-post-type.use-case";
import { FindPostTagsService } from "../services/find-post-tags.service";
import { FindPostTypeBySlugService } from "../services/find-post-type-by-slug.service";
import { FindPostTypesService } from "../services/find-post-types.service";
import { PopulateManyPostsService } from "../services/populate-many-posts.service";
import { PostRepository } from "../../infra/repositories/test/post.repository";
import { PostTagRepository } from "../../infra/repositories/test/post-tag.repository";
import { PostTypeRepository } from "../../infra/repositories/test/post-type.repository";
import { Post } from "../../domain/post";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { generateUUID } from "@caffeine/models/helpers";
import { makeEntityFactory } from "@caffeine/models/factories";

describe("FindManyPostsByPostTypeUseCase", () => {
	let useCase: FindManyPostsByPostTypeUseCase;
	let postRepository: PostRepository;
	let postTagRepository: PostTagRepository;
	let postTypeRepository: PostTypeRepository;

	beforeEach(() => {
		postRepository = new PostRepository();
		postTagRepository = new PostTagRepository();
		postTypeRepository = new PostTypeRepository();

		const findPostTags = new FindPostTagsService(postTagRepository);
		const findPostTypeBySlug = new FindPostTypeBySlugService(
			postTypeRepository,
		);
		const findPostTypes = new FindPostTypesService(postTypeRepository);

		useCase = new FindManyPostsByPostTypeUseCase(
			postRepository,
			findPostTypeBySlug,
			new PopulateManyPostsService(findPostTags, findPostTypes),
		);
	});

	it("should find posts by post type slug and hydrate them", async () => {
		const postType1: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			schema: JSON.stringify({}),
			isHighlighted: false,
			...makeEntityFactory(),
		};
		const postType2: IUnmountedPostType = {
			slug: "news",
			name: "News",
			schema: JSON.stringify({}),
			isHighlighted: false,
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType1, postType2]);

		const postTag: IUnmountedPostTag = {
			slug: "tech",
			name: "Tech",
			hidden: false,
			...makeEntityFactory(),
		};
		postTagRepository.seed([postTag]);

		// Create post for Blog
		await postRepository.create(
			Post.make({
				name: "Blog Post",
				description: "Desc",
				postTypeId: postType1.id,
				tags: [postTag.id],
				cover: "https://example.com/cover.jpg",
			}),
		);

		// Create post for News
		await postRepository.create(
			Post.make({
				name: "News Post",
				description: "Desc",
				postTypeId: postType2.id,
				tags: [postTag.id],
				cover: "https://example.com/cover.jpg",
			}),
		);

		const result = await useCase.run({ page: 1, postType: "blog" });

		expect(result).toHaveLength(1);
		expect(result[0]!.slug).toBe("blog-post");
		expect(result[0]!.postType.slug).toBe("blog");
	});

	it("should return empty if no posts for type", async () => {
		const postType1: IUnmountedPostType = {
			id: "550e8400-e29b-41d4-a716-446655440001",
			slug: "blog",
			name: "Blog",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			schema: JSON.stringify({}),
			isHighlighted: false,
		};
		postTypeRepository.seed([postType1]);

		const result = await useCase.run({ page: 1, postType: "blog" });
		expect(result).toEqual([]);
	});

	it("should throw ResourceNotFoundException if post tag is not found", async () => {
		const postType1: IUnmountedPostType = {
			slug: "blog",
			name: "Blog",
			schema: JSON.stringify({}),
			isHighlighted: false,
			...makeEntityFactory(),
		};
		postTypeRepository.seed([postType1]);

		const post = Post.make({
			name: "Blog Post",
			description: "Desc",
			postTypeId: postType1.id,
			tags: [generateUUID()], // Non-existent tag
			cover: "https://example.com/cover.jpg",
		});

		await postRepository.create(post);

		await expect(useCase.run({ page: 1, postType: "blog" })).rejects.toThrow(
			`post@post::tags->${post.tags[0]}`,
		);
	});
});
