import { describe, it, expect, beforeEach } from "vitest";
import { FindPostTagsService } from "./find-post-tags.service";
import { PostTagRepository } from "@/infra/repositories/test/post-tag.repository";
import { ResourceNotFoundException } from "@caffeine/errors/application";

describe("FindPostTagsService", () => {
	let repository: PostTagRepository;
	let service: FindPostTagsService;

	beforeEach(() => {
		repository = new PostTagRepository();
		service = new FindPostTagsService(repository);
	});

	it("should return all post tags when they exist", async () => {
		const tag1 = {
			id: "tag-1",
			slug: "javascript",
			title: "JavaScript",
		};
		const tag2 = {
			id: "tag-2",
			slug: "typescript",
			title: "TypeScript",
		};
		// @ts-expect-error - Mocking partial interface
		repository.seed([tag1, tag2]);

		const result = await service.run(["tag-1", "tag-2"]);

		expect(result).toEqual([tag1, tag2]);
	});

	it("should return correct order even if requested in different order", async () => {
		const tag1 = {
			id: "tag-1",
			slug: "javascript",
			title: "JavaScript",
		};
		const tag2 = {
			id: "tag-2",
			slug: "typescript",
			title: "TypeScript",
		};
		// @ts-expect-error - Mocking partial interface
		repository.seed([tag1, tag2]);

		const result = await service.run(["tag-2", "tag-1"]);

		expect(result).toEqual([tag2, tag1]);
	});

	it("should throw ResourceNotFoundException when one of the post tags does not exist", async () => {
		const tag1 = {
			id: "tag-1",
			slug: "javascript",
			title: "JavaScript",
		};
		// @ts-expect-error - Mocking partial interface
		repository.seed([tag1]);

		await expect(service.run(["tag-1", "non-existent-id"])).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
