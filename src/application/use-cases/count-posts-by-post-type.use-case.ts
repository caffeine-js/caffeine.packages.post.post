import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";

export class CountPostsByPostTypeUseCase {
	public constructor(private readonly repository: IPostReader) {}

	public async run(postTypeId: string): Promise<number> {
		return await this.repository.countByPostType(postTypeId);
	}
}
