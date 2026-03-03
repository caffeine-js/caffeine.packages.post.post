import type { IPostTypeRepository } from "@/domain/types/repositories/post-type-repository.interface";
import { PostTypeRepository } from "@/infra/repositories/api/post-type.repository";

export function makePostTypeRepository(baseUrl: string): IPostTypeRepository {
    return new PostTypeRepository(baseUrl);
}
