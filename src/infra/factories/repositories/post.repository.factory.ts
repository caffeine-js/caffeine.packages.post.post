import type { IPostRepository } from "@/domain/types/post-repository.interface";
import { PostRepository } from "@/infra/repositories/cached/post.repository";
import { PostRepository as PrismaPostRepository } from "@/infra/repositories/prisma/post.repository";

export function makePostRepository(): IPostRepository {
	return new PostRepository(new PrismaPostRepository());
}
