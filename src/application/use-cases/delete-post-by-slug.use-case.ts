import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class DeletePostBySlugUseCase {
	public constructor(private readonly repository: IPostRepository) {}

	public async run(slug: string): Promise<void> {
		const targetPost = await this.repository.findBySlug(slug);

		if (!targetPost) throw new ResourceNotFoundException(`post@post`);

		await this.repository.delete(targetPost);
	}
}
