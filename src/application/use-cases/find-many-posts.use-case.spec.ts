import { describe, expect, it, beforeEach } from "bun:test";
import { FindManyPostsUseCase } from "./find-many-posts.use-case";
import { PostRepository } from "@/infra/repositories/test/post.repository";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { FindPostTypeService } from "../services/find-post-type.service";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import { Post } from "@/domain";
import type { IPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import type { IPostType } from "@caffeine-packages/post.post-type/domain/types";

const mockPostTag = (overrides?: Partial<IPostTag>): IPostTag =>
	({
		id: "tag-id",
		name: "Tech",
		slug: "tech",
		hidden: false,
		createdAt: new Date().toISOString(),
		rename() {},
		reslug() {},
		changeVisibility() {},
		...overrides,
	}) as IPostTag;

const mockPostType = (overrides?: Partial<IPostType>): IPostType =>
	({
		id: "type-id",
		name: "Blog",
		slug: "blog",
		isHighlighted: true,
		createdAt: new Date().toISOString(),
		rename() {},
		reslug() {},
		setHighlightTo() {},
		...overrides,
	}) as IPostType;

describe("FindManyPostsUseCase", () => {
	let postRepository: PostRepository;
	let postTypeRepository: PostTypeRepository;
	let sut: FindManyPostsUseCase;

	const typeA = mockPostType({ id: "type-a", slug: "blog" });
	const typeB = mockPostType({ id: "type-b", slug: "article" });

	beforeEach(() => {
		postRepository = new PostRepository();
		postTypeRepository = new PostTypeRepository();

		const findPostType = new FindPostTypeService(postTypeRepository);
		sut = new FindManyPostsUseCase(postRepository, findPostType);

		postTypeRepository.seed([typeA, typeB]);
	});

	it("should return all posts when no post type is given", async () => {
		await postRepository.create(
			Post.make({
				name: "Post A",
				description: "Desc",
				cover: "https://example.com/a.jpg",
				type: typeA,
				tags: [],
			}),
		);
		await postRepository.create(
			Post.make({
				name: "Post B",
				description: "Desc",
				cover: "https://example.com/b.jpg",
				type: typeB,
				tags: [],
			}),
		);

		const result = await sut.run(1);

		expect(result).toHaveLength(2);
	});

	it("should return only posts matching the given post type id", async () => {
		await postRepository.create(
			Post.make({
				name: "Post A",
				description: "Desc",
				cover: "https://example.com/a.jpg",
				type: typeA,
				tags: [],
			}),
		);
		await postRepository.create(
			Post.make({
				name: "Post B",
				description: "Desc",
				cover: "https://example.com/b.jpg",
				type: typeB,
				tags: [],
			}),
		);

		const result = await sut.run(1, "type-a");

		expect(result).toHaveLength(1);
		expect(result[0].type.id).toBe("type-a");
	});

	it("should resolve post type by slug before filtering", async () => {
		await postRepository.create(
			Post.make({
				name: "Post A",
				description: "Desc",
				cover: "https://example.com/a.jpg",
				type: typeA,
				tags: [],
			}),
		);

		const result = await sut.run(1, "blog");

		expect(result).toHaveLength(1);
	});

	it("should throw ResourceNotFoundException when post type is not found", async () => {
		expect(sut.run(1, "non-existent")).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});

	it("should return empty array when no posts exist", async () => {
		const result = await sut.run(1);

		expect(result).toEqual([]);
	});

	it("should return empty array for a page beyond existing data", async () => {
		await postRepository.create(
			Post.make({
				name: "Post A",
				description: "Desc",
				cover: "https://example.com/a.jpg",
				type: typeA,
				tags: [],
			}),
		);

		const result = await sut.run(999);

		expect(result).toEqual([]);
	});
});
