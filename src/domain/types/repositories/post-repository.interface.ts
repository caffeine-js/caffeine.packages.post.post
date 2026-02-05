import type { IPostReader } from "./post-reader.interface";
import type { IPostWriter } from "./post-writer.interface";

export interface IPostRepository extends IPostReader, IPostWriter {}
