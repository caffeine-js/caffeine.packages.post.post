import type { IPostRepository } from "../types/post-repository.interface";

export class PostUniquenessChecker {
	public constructor(private readonly repository: IPostRepository) {}

	public async run(slug: string): Promise<boolean> {
		return !!(await this.repository.findBySlug(slug));
	}
}
