import { Elysia } from "elysia";
import { htmx } from "./middleware/htmx/htmx";
import { html } from "./middleware/html/html";

import { plugin as statePlugin } from "./state";

export const basePluginSetup = () => {
  return new Elysia({
    serve: {
      reusePort: true,
    },
  })
    .use(html())
    .use(htmx())
    .use(statePlugin);
};
