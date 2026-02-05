import type { IPostTypeRepository } from "@/domain/types/repositories/post-type-repository.interface";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class FindPostTypeByIdService {
	public constructor(private readonly repository: IPostTypeRepository) {}

	public async run(id: string): Promise<IUnmountedPostType> {
		const postType = await this.repository.findById(id);

		if (!postType)
			throw new ResourceNotFoundException(`post@post::postType->${id}`);

		return postType;
	}
}
