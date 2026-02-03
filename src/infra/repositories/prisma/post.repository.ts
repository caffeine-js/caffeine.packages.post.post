import type { Post } from "@/domain/post";
import type { IUnmountedPost } from "@/domain/types";
import type { IPostRepository } from "@/domain/types/post-repository.interface";
import type { IUnmountedPostType } from "@caffeine-packages/post.post-type/domain/types";
import {
	prisma,
	prismaErrorManager,
} from "@caffeine-packages/post.db.prisma-drive";
import { parsePrismaDateTimeToISOString } from "@caffeine-packages/post.db.prisma-drive/helpers";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";

type PostPrismaDefaultOutput = {
	tags: {
		id: string;
	}[];
	postTypeId: string;
	name: string;
	slug: string;
	description: string;
	cover: string;
	id: string;
	createdAt: Date;
	updatedAt: Date | null;
};

const defaultPostSelect = {
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
	private parsePrismaResponseToUnmountedPost(
		data: PostPrismaDefaultOutput,
	): IUnmountedPost {
		const { tags: _tags, ...properties } = parsePrismaDateTimeToISOString(data);

		const tags = _tags.map((tag) => tag.id);

		return { ...properties, tags };
	}

	async create(post: Post): Promise<void> {
		try {
			const { tags: _tags, ...properties } = post.unpack();
			const tags: { connect: Array<{ id: string }> } = {
				connect: _tags.map((tag) => ({ id: tag })),
			};

			await prisma.post.create({
				data: { ...properties, tags },
			});
		} catch (err: unknown) {
			prismaErrorManager("post@post", err);
		}
	}

	async findById(id: string): Promise<IUnmountedPost | null> {
		const targetPost = await prisma.post.findUnique({
			where: { id },
			select: defaultPostSelect,
		});

		if (!targetPost) return null;

		return this.parsePrismaResponseToUnmountedPost(targetPost);
	}

	async findBySlug(slug: string): Promise<IUnmountedPost | null> {
		const targetPost = await prisma.post.findUnique({
			where: { slug },
			select: defaultPostSelect,
		});

		if (!targetPost) return null;

		return this.parsePrismaResponseToUnmountedPost(targetPost);
	}

	async findMany(page: number): Promise<IUnmountedPost[]> {
		return (
			await prisma.post.findMany({
				skip: MAX_ITEMS_PER_QUERY * page,
				take: MAX_ITEMS_PER_QUERY,
				select: defaultPostSelect,
			})
		).map((item) => this.parsePrismaResponseToUnmountedPost(item));
	}

	async findManyByPostType(
		postType: IUnmountedPostType,
		page: number,
	): Promise<IUnmountedPost[]> {
		return (
			await prisma.post.findMany({
				skip: MAX_ITEMS_PER_QUERY * page,
				take: MAX_ITEMS_PER_QUERY,
				select: defaultPostSelect,
				where: { postTypeId: postType.id },
			})
		).map((item) => this.parsePrismaResponseToUnmountedPost(item));
	}

	async update(post: Post): Promise<void> {
		try {
			const { tags: _tags, ...properties } = post.unpack();

			await prisma.post.update({
				where: { id: post.id },
				data: { ...properties, tags: { set: _tags.map((id) => ({ id })) } },
			});
		} catch (err: unknown) {
			prismaErrorManager("post@post", err);
		}
	}

	async delete(post: Post): Promise<void> {
		try {
			await prisma.post.delete({ where: { id: post.id } });
		} catch (err: unknown) {
			prismaErrorManager("post@post", err);
		}
	}

	length(): Promise<number> {
		return prisma.post.count();
	}
}
