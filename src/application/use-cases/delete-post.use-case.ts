import { detectEntry } from "@caffeine/api-utils/utils";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class DeletePostUseCase {
	public constructor(private readonly repository: IPostRepository) {}

	public async run(id: string): Promise<void> {
		const targetPost =
			detectEntry(id) === "UUID"
				? await this.repository.findById(id)
				: await this.repository.findBySlug(id);

		if (!targetPost) throw new ResourceNotFoundException(`post@post`);

		await this.repository.delete(targetPost);
	}
}
