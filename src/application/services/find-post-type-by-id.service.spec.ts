import { describe, it, expect, beforeEach } from "vitest";
import { FindPostTypeByIdService } from "./find-post-type-by-id.service";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { ResourceNotFoundException } from "@caffeine/errors/application";

describe("FindPostTypeByIdService", () => {
	let repository: PostTypeRepository;
	let service: FindPostTypeByIdService;

	beforeEach(() => {
		repository = new PostTypeRepository();
		service = new FindPostTypeByIdService(repository);
	});

	it("should return the post type when it exists", async () => {
		const postType = {
			id: "type-1",
			slug: "tech",
			title: "Technology",
			schema: "{}",
		};
		repository.seed([postType]);

		const result = await service.run("type-1");

		expect(result).toEqual(postType);
	});

	it("should throw ResourceNotFoundException when post type does not exist", async () => {
		await expect(service.run("non-existent-id")).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
