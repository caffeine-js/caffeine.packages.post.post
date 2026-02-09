import type { IPost } from "@/domain/types";

export interface IPostReader {
	findById(id: string): Promise<IPost | null>;
	findBySlug(slug: string): Promise<IPost | null>;
	findManyByIds(ids: string[]): Promise<Array<IPost | null>>;
	findMany(page: number): Promise<IPost[]>;
	findManyByPostType(postTypeId: string, page: number): Promise<IPost[]>;
	count(): Promise<number>;
	countByPostType(postTypeId: string): Promise<number>;
}
