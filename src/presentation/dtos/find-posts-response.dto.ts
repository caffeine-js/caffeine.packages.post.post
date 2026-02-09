import { t } from "@caffeine/models";
import { CompletePostDTO } from "@/application/dtos/complete-post.dto";

export const FindPostsResponseDTO = t.Array(CompletePostDTO, {
	description: "A paginated list of posts, ordered by creation date.",
});
