import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import type { PrismaClient } from "@caffeine-adapters/post";
import type { CaffeineCacheInstance } from "@caffeine/cache";
import type { RepositoryProviderDTO } from "./dtos";
import { ResourceNotFoundException } from "@caffeine/errors/infra";
import { Post } from "@/domain";
import { EntitySource } from "@caffeine/entity/symbols";
import { PostRepository as PrismaPostRepository } from "@/infra/repositories/prisma";
import { PostRepository as TestPostRepository } from "@/infra/repositories/test";
import { PostRepository as CachedPostRepository } from "@/infra/repositories/cached";

type MakePostRepositoryArgs = {
    target?: RepositoryProviderDTO;
    cache: CaffeineCacheInstance;
    prismaClient?: PrismaClient;
};

export function makePostRepository({
    cache,
    prismaClient,
    target,
}: MakePostRepositoryArgs): IPostRepository {
    if (target === "PRISMA" && !prismaClient)
        throw new ResourceNotFoundException(Post[EntitySource]);

    const repository: IPostRepository =
        target === "PRISMA" && prismaClient
            ? new PrismaPostRepository(prismaClient)
            : new TestPostRepository();

    return new CachedPostRepository(repository, cache);
}
