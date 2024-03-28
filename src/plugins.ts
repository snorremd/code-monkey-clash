import { Elysia } from "elysia";
import { htmx } from "elysia-htmx";
import cookie from "@elysiajs/cookie";

import { plugin as statePlugin } from "./state";

export const basePluginSetup = () => {
  return new Elysia({
    serve: {
      reusePort: true,
    },
  })
    .use(cookie())
    .use(htmx())
    .use(statePlugin);
};
