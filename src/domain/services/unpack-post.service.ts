import type { IPost, IUnpackedPost } from "../types";

export const UnpackPost = {
	run: ({
		id,
		createdAt,
		updatedAt,
		cover,
		description,
		name,
		postTypeId,
		slug,
		tags,
	}: IPost): IUnpackedPost => {
		return {
			id,
			createdAt,
			updatedAt,
			cover,
			description,
			name,
			postTypeId,
			slug,
			tags,
		};
	},
};
