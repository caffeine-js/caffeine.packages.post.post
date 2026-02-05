import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class FindPostTagByIdService {
	public constructor(private readonly repository: IPostTagRepository) {}

	public async run(id: string): Promise<IUnmountedPostTag> {
		const targetTag = await this.repository.findById(id);

		if (!targetTag)
			throw new ResourceNotFoundException(`post@post::tags->${id}`);

		return targetTag;
	}
}
