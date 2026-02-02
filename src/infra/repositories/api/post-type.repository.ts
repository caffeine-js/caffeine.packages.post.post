import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface copy";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import type { PostTypeRoutes } from "@caffeine-packages/post.post-type/presentation";
import { treaty } from "@elysiajs/eden";

export class PostTypeRepository implements IPostTypeRepository {
	private readonly postTagTypeService = treaty<PostTypeRoutes>(
		process.env.POST_BASE_URL,
	)["post-type"];

	async findBySlug(slug: string): Promise<IUnmountedPostType | null> {
		const targetPostTagRequest = await this.postTagTypeService({ slug }).get();

		if (targetPostTagRequest.error) throw targetPostTagRequest.error.value;

		if (targetPostTagRequest.status !== 200) return null;

		return targetPostTagRequest.data;
	}
}
