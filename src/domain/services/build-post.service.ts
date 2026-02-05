import { Schema } from "@caffeine/models/schema";
import { UnmountedPostDTO } from "../dtos/unmounted-post.dto";
import { Post } from "../post";
import type { IPost, IUnpackedPost } from "../types";
import { InvalidDomainDataException } from "@caffeine/errors/domain";

export const BuildPost = {
	run: (unmountedPostTag: IUnpackedPost): IPost => {
		if (!Schema.make(UnmountedPostDTO).match(unmountedPostTag))
			throw new InvalidDomainDataException("post@post::unmount");

		const { id, createdAt, updatedAt, ...properties } = unmountedPostTag;

		return Post.make(properties, { id, createdAt, updatedAt });
	},
} as const;
