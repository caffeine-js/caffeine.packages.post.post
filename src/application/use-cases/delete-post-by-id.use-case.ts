import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class DeletePostByIdUseCase {
	public constructor(private readonly repository: IPostRepository) {}

	public async run(id: string): Promise<void> {
		const targetPost = await this.repository.findById(id);

		if (!targetPost) throw new ResourceNotFoundException(`post@post`);

		await this.repository.delete(targetPost);
	}
}
