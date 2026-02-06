import type { IPostTypeRepository } from "@/domain/types/repositories/post-type-repository.interface";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { PostTypeRoutes } from "@caffeine-packages/post.post-type/presentation";
import { treaty } from "@elysiajs/eden";

export class PostTypeRepository implements IPostTypeRepository {
	private readonly postTagTypeService;

	public constructor(baseUrl: string) {
		this.postTagTypeService = treaty<PostTypeRoutes>(baseUrl)["post-type"];
	}

	async findById(id: string): Promise<IUnmountedPostType | null> {
		const targetPostTypeRequest = await this.postTagTypeService({ id }).get();

		if (targetPostTypeRequest.error) throw targetPostTypeRequest.error.value;

		if (targetPostTypeRequest.status !== 200) return null;

		return targetPostTypeRequest.data;
	}

	async findBySlug(slug: string): Promise<IUnmountedPostType | null> {
		const targetPostTypeRequest = await this.postTagTypeService["by-slug"]({
			slug,
		}).get();

		if (targetPostTypeRequest.error) throw targetPostTypeRequest.error.value;

		if (targetPostTypeRequest.status !== 200) return null;

		return targetPostTypeRequest.data;
	}
}
