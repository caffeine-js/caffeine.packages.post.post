import type { IEntity } from "@caffeine/models/types";

export interface IUnpackedPost extends IEntity {
	postTypeId: string;
	name: string;
	slug: string;
	description: string;
	cover: string;
	tags: string[];
}
