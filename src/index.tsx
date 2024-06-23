import staticPlugin from "@elysiajs/static";
import { Elysia, t } from "elysia";

import { htmlPlugin } from "./middleware/html/html";
import { statePlugin } from "./middleware/state/state";
import { plugin as adminPlugin } from "./pages/admin";
import { plugin as homePlugin } from "./pages/home/home";
import { notFoundPlugin } from "./pages/not-found/not-found";
import { plugin as playerPlugin } from "./pages/player";
import { plugin as signupPlugin } from "./pages/signup";
import { htmxPlugin } from "./middleware/htmx/htmx";

const app = new Elysia({
  serve: {
    reusePort: true,
  },
})
  .use(htmlPlugin())
  .use(statePlugin())
  .use(htmxPlugin())
  .use(staticPlugin())
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
