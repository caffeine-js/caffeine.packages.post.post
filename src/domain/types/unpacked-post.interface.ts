import type { IRawEntity } from "@caffeine/entity/types";
import type { IRawPost } from "./raw-post.interface";

export interface IUnpackedPost extends IRawPost, IRawEntity {}
