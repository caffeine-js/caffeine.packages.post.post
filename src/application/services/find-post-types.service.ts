import type { IPostTypeRepository } from "@/domain/types/repositories/post-type-repository.interface";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import { FindPostTypeByIdService } from "./find-post-type-by-id.service";

export class FindPostTypesService {
	private readonly findById: FindPostTypeByIdService;

	public constructor(readonly repository: IPostTypeRepository) {
		this.findById = new FindPostTypeByIdService(repository);
	}

	public async run(ids: string[]): Promise<IUnmountedPostType[]> {
		return Promise.all(ids.map((id) => this.findById.run(id)));
	}
}
