import type { IPostRepository } from "@/domain/types/post-repository.interface";

export class CountPostsUseCase {
	public constructor(private readonly repository: IPostRepository) {}

	public async run(): Promise<number> {
		return await this.repository.length();
	}
}
