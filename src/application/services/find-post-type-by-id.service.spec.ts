import { describe, it, expect, beforeEach } from "vitest";
import { FindPostTypeByIdService } from "./find-post-type-by-id.service";
import { PostTypeRepository } from "@/infra/repositories/test/post-type.repository";
import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import { makeEntityFactory } from "@caffeine/models/factories";

describe("FindPostTypeByIdService", () => {
	let repository: PostTypeRepository;
	let service: FindPostTypeByIdService;

	beforeEach(() => {
		repository = new PostTypeRepository();
		service = new FindPostTypeByIdService(repository);
	});

	it("should return the post type when it exists", async () => {
		const postType: IUnmountedPostType = {
			slug: "tech",
			name: "Technology",
			schema: "{}",
			isHighlighted: true,
			...makeEntityFactory(),
		};
		repository.seed([postType]);

		const result = await service.run(postType.id);

		expect(result).toEqual(postType);
	});

	it("should throw ResourceNotFoundException when post type does not exist", async () => {
		await expect(service.run("non-existent-id")).rejects.toThrow(
			ResourceNotFoundException,
		);
	});
});
