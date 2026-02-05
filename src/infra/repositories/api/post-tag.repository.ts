import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import type { PostTagRoutes } from "@caffeine-packages/post.post-tag/presentation";
import { treaty } from "@elysiajs/eden";

export class PostTagRepository implements IPostTagRepository {
	private readonly postTagService = treaty<PostTagRoutes>(
		process.env.POST_BASE_URL,
	)["post-tag"];

	async findById(id: string): Promise<IUnmountedPostTag | null> {
		const targetPostTagRequest = await this.postTagService({
			id,
		}).get();

		if (targetPostTagRequest.error) throw targetPostTagRequest.error.value;

		if (targetPostTagRequest.status !== 200) return null;

		return targetPostTagRequest.data;
	}
}
