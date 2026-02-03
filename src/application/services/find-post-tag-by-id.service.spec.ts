import { describe, it, expect, beforeEach } from "vitest";
import { FindPostTagByIdService } from "./find-post-tag-by-id.service";
import { PostTagRepository } from "@/infra/repositories/test/post-tag.repository";
import { ResourceNotFoundException } from "@caffeine/errors/application";

describe("FindPostTagByIdService", () => {
	let repository: PostTagRepository;
	let service: FindPostTagByIdService;

	beforeEach(() => {
		repository = new PostTagRepository();
		service = new FindPostTagByIdService(repository);
	});

	it("should return the post tag when it exists", async () => {
		const postTag = {
			id: "tag-1",
			slug: "javascript",
			title: "JavaScript",
		};
		// @ts-expect-error - Mocking partial interface if needed
		repository.seed([postTag]);

		const result = await service.run("tag-1");

		expect(result).toEqual(postTag);
	});

	it("should throw ResourceNotFoundException when post tag does not exist", async () => {
		await expect(service.run("non-existent-id")).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
