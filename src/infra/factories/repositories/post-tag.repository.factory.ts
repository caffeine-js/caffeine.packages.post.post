import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import { PostTagRepository } from "@/infra/repositories/api/post-tag.repository";

export function makePostTagRepository(baseUrl: string): IPostTagRepository {
    return new PostTagRepository(baseUrl);
}
