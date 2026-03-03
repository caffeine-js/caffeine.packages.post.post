import type { IPostTagRepository } from "@/domain/types/repositories/post-tag-repository.interface";
import type { IPostTag } from "@caffeine-packages/post.post-tag/domain/types";
import type { PostTagRoutes } from "@caffeine-packages/post.post-tag/presentation/routes";
import { PostTag } from "@caffeine-packages/post.post-tag/domain";
import { treaty } from "@elysiajs/eden";

export class PostTagRepository implements IPostTagRepository {
    private readonly postTagService: ReturnType<
        typeof treaty<PostTagRoutes>
    >["post-tags"];

    public constructor(baseUrl: string) {
        this.postTagService = treaty<PostTagRoutes>(baseUrl)["post-tags"];
    }

    async find(idOrSlug: string): Promise<IPostTag | null> {
        const { data, status, error } = await this.postTagService({
            "id-or-slug": idOrSlug,
        }).get();

        if (error) throw error.value;
        if (status !== 200) return null;

        const { name, slug, hidden, ...entityProps } = data!;

        return PostTag.make({ name, slug, hidden }, entityProps);
    }
}
