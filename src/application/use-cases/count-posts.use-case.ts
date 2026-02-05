import type { IPostReader } from "@/domain/types/repositories/post-reader.interface";

export class CountPostsUseCase {
	public constructor(private readonly repository: IPostReader) {}

	public async run(): Promise<number> {
		return await this.repository.count();
	}
}
