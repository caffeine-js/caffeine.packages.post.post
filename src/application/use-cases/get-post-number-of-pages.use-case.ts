import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";

export class GetPostNumberOfPagesUseCase {
	public constructor(private readonly repository: IPostReader) {}

	public async run(): Promise<number> {
		const postLength = await this.repository.count();
		return Math.ceil(postLength / MAX_ITEMS_PER_QUERY);
	}
}
