import { ResourceNotFoundException } from "@caffeine/errors/application";
import type { ICompletePost } from "../types/complete-post.interface";
import type { PopulatePostService } from "../services/populate-post.service";
import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";
import { detectEntry } from "@caffeine/api-utils/utils";

export class FindPostUseCase {
	public constructor(
		private readonly repository: IPostReader,
		private readonly populatePost: PopulatePostService,
	) {}

	public async run(id: string): Promise<ICompletePost> {
		const targetPost =
			detectEntry(id) === "UUID"
				? await this.repository.findById(id)
				: await this.repository.findBySlug(id);

		if (!targetPost) throw new ResourceNotFoundException(`post@post`);

		return await this.populatePost.run(targetPost);
	}
}
