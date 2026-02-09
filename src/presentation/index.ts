import Elysia from "elysia";
import { CreatePostController } from "./controllers/create-post.controller";
import { DeletePostController } from "./controllers/delete-post.controller";
import { FindPostsController } from "./controllers/find-posts.controller";
import { FindPostController } from "./controllers/find-post.controller";
import { UpdatePostController } from "./controllers/update-post.controller";

export const PostRoutes = new Elysia({ prefix: "/post" })
	.use(CreatePostController)
	.use(DeletePostController)
	.use(FindPostsController)
	.use(FindPostController)
	.use(UpdatePostController);

export type PostRoutes = typeof PostRoutes;
