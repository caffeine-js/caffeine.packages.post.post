import { UnpackPost } from "@/domain/services";
import { BuildPost } from "@/domain/services/build-post.service";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import { ResourceNotFoundException } from "@caffeine/errors/application";

export class DeletePostBySlugUseCase {
	public constructor(private readonly repository: IPostRepository) {}

	public async run(slug: string): Promise<void> {
		const _targetPost = await this.repository.findBySlug(slug);

		if (!_targetPost) throw new ResourceNotFoundException(`post@post`);

		const targetPost = BuildPost.run(UnpackPost.run(_targetPost));

		await this.repository.delete(targetPost);
	}
}
