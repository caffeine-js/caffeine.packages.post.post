import type { IPostRepository } from "@/domain/types/post-repository.interface";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";

export class GetPostNumberOfPagesUseCase {
	public constructor(private readonly repository: IPostRepository) {}

	public async run(): Promise<number> {
		const postLength = await this.repository.length();
		return Math.ceil(postLength / MAX_ITEMS_PER_QUERY);
	}
}
