import type { IPost } from "@/domain/types";

export interface IPostWriter {
	create(post: IPost): Promise<void>;
	update(post: IPost): Promise<void>;
	delete(post: IPost): Promise<void>;
}
