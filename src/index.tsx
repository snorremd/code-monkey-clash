import staticPlugin from "@elysiajs/static";
import { Elysia, t } from "elysia";

import { state } from "./game/state";
import { htmlPlugin } from "./middleware/html/html";
import { htmxPlugin } from "./middleware/htmx/htmx";
import { plugin as adminPlugin } from "./pages/admin";
import { plugin as homePlugin } from "./pages/home/home";
import { notFoundPlugin } from "./pages/not-found/not-found";
import { plugin as playerPlugin } from "./pages/player";
import { scoreboardPlugin } from "./pages/scoreboard/scoreboard";
import { plugin as signupPlugin } from "./pages/signup";

const app = new Elysia({
	serve: {
		reusePort: true,
	},
})
	.state("state", state)
	.use(htmlPlugin())
	.use(htmxPlugin())
	.use(staticPlugin())
	.get("/public/htmx.min.js", () =>
		Bun.file("node_modules/htmx.org/dist/htmx.min.js"),
	)
	.get("/public/response-targets.js", () =>
		Bun.file("node_modules/htmx.org/dist/ext/response-targets.js"),
	)
	.get("/public/sse.js", () =>
		Bun.file("node_modules/htmx.org/dist/ext/sse.js"),
	)
	.use(adminPlugin)
	.use(homePlugin)
	.use(scoreboardPlugin)
	.use(signupPlugin)
	.use(playerPlugin)
	.use(notFoundPlugin);

app.listen(3000);

console.info(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
