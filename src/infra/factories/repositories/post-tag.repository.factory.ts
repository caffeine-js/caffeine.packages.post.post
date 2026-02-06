import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";

export function makePostTagRepository(): IPostTagRepository {
	return new PostTagRepository(process.env.POST_BASE_URL);
}
