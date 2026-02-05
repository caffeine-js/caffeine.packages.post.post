import type { IPostReader } from "../types/repositories/post-reader.interface";

export class PostUniquenessChecker {
	public constructor(private readonly reader: IPostReader) {}

	public async run(slug: string): Promise<boolean> {
		return !(await this.reader.findBySlug(slug));
	}
}
