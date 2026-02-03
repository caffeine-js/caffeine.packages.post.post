import type { IPostTypeRepository } from "@/domain/types/post-type-repository.interface";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class FindPostTypeBySlugService {
	public constructor(private readonly repository: IPostTypeRepository) {}

	public async run(slug: string): Promise<IUnmountedPostType> {
		const postType = await this.repository.findBySlug(slug);

		if (!postType)
			throw new ResourceNotFoundException(`post@post::postType->${slug}`);

		return postType;
	}
}
