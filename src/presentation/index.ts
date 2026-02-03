import Elysia from "elysia";
import { CountPostsController } from "./controllers/count-posts.controller";
import { CreatePostController } from "./controllers/create-post.controller";
import { DeletePostBySlugController } from "./controllers/delete-post-by-slug.controller";
import { FindManyPostsByPostTypeController } from "./controllers/find-many-posts-by-post-type.controller";
import { FindManyPostsController } from "./controllers/find-many-posts.controller";
import { FindPostByIdController } from "./controllers/find-post-by-id.controller";
import { FindPostBySlugController } from "./controllers/find-post-by-slug.controller";
import { GetPostNumberOfPagesController } from "./controllers/get-post-number-of-pages.controller";
import { UpdatePostBySlugController } from "./controllers/update-post-by-slug.controller";

export const PostRoutes = new Elysia({ prefix: "/post" })
	.use(CountPostsController)
	.use(CreatePostController)
	.use(DeletePostBySlugController)
	.use(FindManyPostsByPostTypeController)
	.use(FindManyPostsController)
	.use(FindPostByIdController)
	.use(FindPostBySlugController)
	.use(GetPostNumberOfPagesController)
	.use(UpdatePostBySlugController);

export type PostRoutes = typeof PostRoutes;
