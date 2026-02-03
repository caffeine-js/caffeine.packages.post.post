import { describe, it, expect, beforeEach } from "vitest";
import { FindPostTypesService } from "./find-post-types.service";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { ResourceNotFoundException } from "@caffeine/errors/application";

describe("FindPostTypesService", () => {
	let repository: PostTypeRepository;
	let service: FindPostTypesService;

	beforeEach(() => {
		repository = new PostTypeRepository();
		service = new FindPostTypesService(repository);
	});

	it("should return all post types when they exist", async () => {
		const type1 = {
			id: "type-1",
			slug: "tech",
			title: "Technology",
			schema: "{}",
		};
		const type2 = {
			id: "type-2",
			slug: "news",
			title: "News",
			schema: "{}",
		};
		repository.seed([type1, type2]);

		const result = await service.run(["type-1", "type-2"]);

		expect(result).toEqual([type1, type2]);
	});

	it("should return correct order even if requested in different order (Promise.all preserves order)", async () => {
		const type1 = {
			id: "type-1",
			slug: "tech",
			title: "Technology",
			schema: "{}",
		};
		const type2 = {
			id: "type-2",
			slug: "news",
			title: "News",
			schema: "{}",
		};
		repository.seed([type1, type2]);

		const result = await service.run(["type-2", "type-1"]);

		expect(result).toEqual([type2, type1]);
	});

	it("should throw ResourceNotFoundException when one of the post types does not exist", async () => {
		const type1 = {
			id: "type-1",
			slug: "tech",
			title: "Technology",
			schema: "{}",
		};
		repository.seed([type1]);

		await expect(service.run(["type-1", "non-existent-id"])).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
