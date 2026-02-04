import type { IPost, IUnmountedPost } from "../types";

export const UnpackPost = {
	run: (post: IPost): IUnmountedPost => {
		const {
			id,
			createdAt,
			updatedAt,
			cover,
			description,
			name,
			postTypeId,
			slug,
			tags,
		} = post;
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
