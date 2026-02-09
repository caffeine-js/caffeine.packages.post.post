import type { IPost } from "@/domain/types";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import { prisma } from "@caffeine-packages/post.db.prisma-drive";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";
import { UnpackPost } from "@/domain/services";
import { PrismaPostMapper } from "./prisma-post.mapper";
import { SafePrisma } from "@caffeine-packages/post.db.prisma-drive/decorators";

const DEFAULT_POST_SELECT = {
	tags: { select: { id: true } },
	id: true,
	createdAt: true,
	updatedAt: true,
	cover: true,
	name: true,
	slug: true,
	description: true,
	postTypeId: true,
} as const;

export class PostRepository implements IPostRepository {
	@SafePrisma("post@post")
	async create(post: IPost): Promise<void> {
		const { tags: _tags, ...properties } = UnpackPost.run(post);
		const tags: { connect: Array<{ id: string }> } = {
			connect: _tags.map((tag) => ({ id: tag })),
		};

		await prisma.post.create({
			data: { ...properties, tags },
		});
	}

	@SafePrisma("post@post")
	async findById(id: string): Promise<IPost | null> {
		const targetPost = await prisma.post.findUnique({
			where: { id },
			select: DEFAULT_POST_SELECT,
		});

		if (!targetPost) return null;

		return PrismaPostMapper.run(targetPost);
	}

	@SafePrisma("post@post")
	async findBySlug(slug: string): Promise<IPost | null> {
		const targetPost = await prisma.post.findUnique({
			where: { slug },
			select: DEFAULT_POST_SELECT,
		});

		if (!targetPost) return null;

		return PrismaPostMapper.run(targetPost);
	}

	@SafePrisma("post@post")
	async findMany(page: number): Promise<IPost[]> {
		return (
			await prisma.post.findMany({
				skip: MAX_ITEMS_PER_QUERY * (page - 1),
				take: MAX_ITEMS_PER_QUERY,
				select: DEFAULT_POST_SELECT,
			})
		).map((item) => PrismaPostMapper.run(item));
	}

	@SafePrisma("post@post")
	async findManyByIds(ids: string[]): Promise<Array<IPost | null>> {
		const posts = await prisma.post.findMany({
			where: { id: { in: ids } },
			select: DEFAULT_POST_SELECT,
		});

		const postsMap = new Map(posts.map((post) => [post.id, post]));

		return ids.map((id) => {
			const post = postsMap.get(id);
			return post ? PrismaPostMapper.run(post) : null;
		});
	}

	@SafePrisma("post@post")
	async findManyByPostType(postTypeId: string, page: number): Promise<IPost[]> {
		return (
			await prisma.post.findMany({
				skip: MAX_ITEMS_PER_QUERY * (page - 1),
				take: MAX_ITEMS_PER_QUERY,
				select: DEFAULT_POST_SELECT,
				where: { postTypeId },
			})
		).map((item) => PrismaPostMapper.run(item));
	}

	@SafePrisma("post@post")
	async update(post: IPost): Promise<void> {
		const { tags: _tags, ...properties } = UnpackPost.run(post);

		await prisma.post.update({
			where: { id: post.id },
			data: { ...properties, tags: { set: _tags.map((id) => ({ id })) } },
		});
	}

	@SafePrisma("post@post")
	async delete(post: IPost): Promise<void> {
		await prisma.post.delete({ where: { id: post.id } });
	}

	@SafePrisma("post@post")
	async count(): Promise<number> {
		return prisma.post.count();
	}

	@SafePrisma("post@post")
	countByPostType(postTypeId: string): Promise<number> {
		return prisma.post.count({ where: { postTypeId } });
	}
}
