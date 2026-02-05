import { describe, it, expect, beforeEach } from "vitest";
import { FindPostTypesService } from "./find-post-types.service";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import { makeEntityFactory } from "@caffeine/models/factories";

describe("FindPostTypesService", () => {
	let repository: PostTypeRepository;
	let service: FindPostTypesService;

	beforeEach(() => {
		repository = new PostTypeRepository();
		service = new FindPostTypesService(repository);
	});

	it("should return all post types when they exist", async () => {
		const type1: IUnmountedPostType = {
			slug: "tech",
			name: "Technology",
			schema: "{}",
			isHighlighted: true,
			...makeEntityFactory(),
		};

		const type2: IUnmountedPostType = {
			slug: "news",
			name: "News",
			schema: "{}",
			isHighlighted: false,
			...makeEntityFactory(),
		};
		repository.seed([type1, type2]);

		const result = await service.run([type1, type2].map((i) => i.id));

		expect(result).toEqual([type1, type2]);
	});

	it("should return correct order even if requested in different order (Promise.all preserves order)", async () => {
		const type1: IUnmountedPostType = {
			slug: "tech",
			name: "Technology",
			schema: "{}",
			isHighlighted: true,
			...makeEntityFactory(),
		};

		const type2: IUnmountedPostType = {
			slug: "news",
			name: "News",
			schema: "{}",
			isHighlighted: false,
			...makeEntityFactory(),
		};
		repository.seed([type1, type2]);

		const result = await service.run([type1, type2].map((i) => i.id));

		expect(result).toEqual([type1, type2]);
	});

	it("should throw ResourceNotFoundException when one of the post types does not exist", async () => {
		const type1: IUnmountedPostType = {
			slug: "tech",
			name: "Technology",
			schema: "{}",
			isHighlighted: true,
			...makeEntityFactory(),
		};

		repository.seed([type1]);

		await expect(service.run([type1.id, "type-2"])).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
