import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";
import { PaginationService } from "@caffeine/api-utils/services";

type ICountPosts = {
	totalPages: number;
	count: number;
};

export class CountPostsUseCase {
	public constructor(private readonly repository: IPostReader) {}

	public async run(postTypeId?: string): Promise<ICountPosts> {
		const count = await (postTypeId
			? this.repository.countByPostType(postTypeId)
			: this.repository.count());

		return {
			totalPages: PaginationService.run(count),
			count,
		};
	}
}
