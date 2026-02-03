import { describe, it, expect, beforeEach } from "vitest";
import { FindPostTypeBySlugService } from "./find-post-type-by-slug.service";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { ResourceNotFoundException } from "@caffeine/errors/application";

describe("FindPostTypeBySlugService", () => {
	let repository: PostTypeRepository;
	let service: FindPostTypeBySlugService;

	beforeEach(() => {
		repository = new PostTypeRepository();
		service = new FindPostTypeBySlugService(repository);
	});

	it("should return the post type when it exists", async () => {
		const postType = {
			id: "type-1",
			slug: "tech",
			title: "Technology",
			schema: "{}",
		};
		repository.seed([postType]);

		const result = await service.run("tech");

		expect(result).toEqual(postType);
	});

	it("should throw ResourceNotFoundException when post type does not exist", async () => {
		await expect(service.run("non-existent-slug")).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
