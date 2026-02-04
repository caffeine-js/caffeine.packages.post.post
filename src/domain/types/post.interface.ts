import type { IEntity } from "@caffeine/models/types";

export interface IPost extends IEntity {
	readonly postTypeId: string;
	readonly name: string;
	readonly slug: string;
	readonly description: string;
	readonly cover: string;
	readonly tags: string[];

	rename(value: string): void;
	updateDescription(value: string): void;
	updateCover(value: string): void;
	updateTags(values: string[]): void;
}
