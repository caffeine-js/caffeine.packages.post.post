import type { IPost, IUnmountedPost } from "../types";

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
	}: IPost): IUnmountedPost => {
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
