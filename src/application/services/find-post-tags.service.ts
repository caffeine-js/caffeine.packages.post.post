import type { IPostTagRepository } from "@/domain/types/post-tag-repository.interface";
import type { IUnmountedPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import { FindPostTagByIdService } from "./find-post-tag-by-id.service";

export class FindPostTagsService {
	private readonly findById: FindPostTagByIdService;

	public constructor(private readonly repository: IPostTagRepository) {
		this.findById = new FindPostTagByIdService(repository);
	}

	public async run(tags: string[]): Promise<IUnmountedPostTag[]> {
		return Promise.all(tags.map((tag) => this.findById.run(tag)));
	}
}
