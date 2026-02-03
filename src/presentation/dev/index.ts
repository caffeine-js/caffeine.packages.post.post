import Elysia from "elysia";
import { PostRoutes } from "..";
import openapi from "@elysiajs/openapi";

new Elysia()
	.use(openapi({ path: "/docs" }))
	.use(PostRoutes)
	.listen(8080, () => {
		console.log(`🦊 server is running at: http://localhost:8080`);
	});
