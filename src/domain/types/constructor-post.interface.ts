import type { IPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import type { IPostType } from "@caffeine-packages/post.post-type/domain/types";

export interface IConstructorPost {
    type: IPostType;
    name: string;
    slug?: string;
    description: string;
    cover: string;
    tags: IPostTag[];
}
