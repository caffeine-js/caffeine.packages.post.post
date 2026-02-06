import { Post } from "@/domain";
import type { IPost, IUnpackedPost } from "@/domain/types";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { UnexpectedCacheValueException } from "@caffeine/errors/infra";

export const CachedPostMapper = {
	run: (key: string, data: string | IUnpackedPost): IPost => {
		const { id, createdAt, updatedAt, ...properties }: IUnpackedPost =
			typeof data === "string" ? JSON.parse(data) : data;

		try {
			return Post.make(properties, { id, createdAt, updatedAt });
		} catch (err: unknown) {
			if (err instanceof InvalidDomainDataException)
				throw new UnexpectedCacheValueException(
					key,
					err.layerName,
					err.message,
				);

			throw err;
		}
	},
} as const;
