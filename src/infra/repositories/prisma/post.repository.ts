import { Post } from "@/domain/post";
import type { IPost } from "@/domain/types";
import type { IPostRepository } from "@/domain/types/repositories/post-repository.interface";
import {
	prisma,
	prismaErrorManager,
} from "@caffeine-packages/post.db.prisma-drive";
import { parsePrismaDateTimeToISOString } from "@caffeine-packages/post.db.prisma-drive/helpers";
import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";
import { UnpackPost } from "@/domain/services";

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
	private getPost(data: PostPrismaDefaultOutput): IPost {
		const {
			tags: _tags,
			id,
			createdAt,
			updatedAt,
			...properties
		} = parsePrismaDateTimeToISOString(data);

		const tags = _tags.map((tag) => tag.id);

		return Post.make({ ...properties, tags }, { id, createdAt, updatedAt });
	}

	async create(post: IPost): Promise<void> {
		try {
			const { tags: _tags, ...properties } = UnpackPost.run(post);
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

	async findById(id: string): Promise<IPost | null> {
		const targetPost = await prisma.post.findUnique({
			where: { id },
			select: defaultPostSelect,
		});

		if (!targetPost) return null;

		return this.getPost(targetPost);
	}

	async findBySlug(slug: string): Promise<IPost | null> {
		const targetPost = await prisma.post.findUnique({
			where: { slug },
			select: defaultPostSelect,
		});

		if (!targetPost) return null;

		return this.getPost(targetPost);
	}

	async findMany(page: number): Promise<IPost[]> {
		return (
			await prisma.post.findMany({
				skip: MAX_ITEMS_PER_QUERY * page,
				take: MAX_ITEMS_PER_QUERY,
				select: defaultPostSelect,
			})
		).map((item) => this.getPost(item));
	}

	async findManyByPostType(postTypeId: string, page: number): Promise<IPost[]> {
		return (
			await prisma.post.findMany({
				skip: MAX_ITEMS_PER_QUERY * page,
				take: MAX_ITEMS_PER_QUERY,
				select: defaultPostSelect,
				where: { postTypeId: postTypeId },
			})
		).map((item) => this.getPost(item));
	}

	async update(post: IPost): Promise<void> {
		try {
			const { tags: _tags, ...properties } = UnpackPost.run(post);

			await prisma.post.update({
				where: { id: post.id },
				data: { ...properties, tags: { set: _tags.map((id) => ({ id })) } },
			});
		} catch (err: unknown) {
			prismaErrorManager("post@post", err);
		}
	}

	async delete(post: IPost): Promise<void> {
		try {
			await prisma.post.delete({ where: { id: post.id } });
		} catch (err: unknown) {
			prismaErrorManager("post@post", err);
		}
	}

	count(): Promise<number> {
		return prisma.post.count();
	}
}
