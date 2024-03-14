import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import staticPlugin from "@elysiajs/static";

import { plugin as adminPlugin } from "./pages/admin";
import { plugin as homePlugin } from "./pages/home";
import { plugin as signupPlugin } from "./pages/signup";
import { plugin as playerPlugin } from "./pages/player";
import { plugin as statePlugin } from "./state";

new Elysia()
  .use(html())
  .use(staticPlugin())
  .use(statePlugin)
  .get("/public/htmx.min.js", () =>  Bun.file("node_modules/htmx.org/dist/htmx.min.js"))
  .get("/public/response-targets.js", () => Bun.file("node_modules/htmx.org/dist/ext/response-targets.js"))
  .use(adminPlugin)
  .use(homePlugin)
  .use(signupPlugin)
  .use(playerPlugin)


  .listen(3000);

  