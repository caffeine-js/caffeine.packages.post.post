import { FindPostUseCase } from "@/application/use-cases/find-post.use-case";
import type { IPostRepository } from "@/domain/types/repositories";
import { FindEntityByTypeUseCase } from "@caffeine/application/use-cases";

export function makeFindPostUseCase(
    postRepository: IPostRepository,
): FindPostUseCase {
    return new FindPostUseCase(new FindEntityByTypeUseCase(postRepository));
}
