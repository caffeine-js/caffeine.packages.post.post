import { Post } from "@/domain";
import type { IPost } from "@/domain/types";
import { parsePrismaDateTimeToISOString } from "@caffeine-packages/post.db.prisma-drive/helpers";

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

export const PrismaPostMapper = {
	run: (data: PostPrismaDefaultOutput): IPost => {
		const {
			tags: _tags,
			id,
			createdAt,
			updatedAt,
			...properties
		} = parsePrismaDateTimeToISOString(data);

		const tags = _tags.map((tag) => tag.id);

		return Post.make({ ...properties, tags }, { id, createdAt, updatedAt });
	},
} as const;
