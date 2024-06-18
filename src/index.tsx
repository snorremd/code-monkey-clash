import staticPlugin from "@elysiajs/static";
import { Elysia, t } from "elysia";

import { plugin as adminPlugin } from "./pages/admin";
import { plugin as homePlugin } from "./pages/home/home";
import { plugin as playerPlugin } from "./pages/player";
import { plugin as signupPlugin } from "./pages/signup";
import { plugin as statePlugin } from "./state";
import { notFoundPlugin } from "./pages/not-found/not-found";
import { html } from "./middleware/html/html";

const app = new Elysia({
  serve: {
    reusePort: true,
  },
})
  .use(html())
  .use(staticPlugin())
  .use(statePlugin)
  .get("/public/htmx.min.js", () =>
    Bun.file("node_modules/htmx.org/dist/htmx.min.js")
  )
  .get("/public/response-targets.js", () =>
    Bun.file("node_modules/htmx.org/dist/ext/response-targets.js")
  )
  .use(adminPlugin)
  .use(homePlugin)
  .use(signupPlugin)
  .use(playerPlugin)
  .use(notFoundPlugin);

app.listen(3000);

console.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
