import { Elysia } from "elysia";
import { htmlPlugin } from "./middleware/html/html";
import { htmxPlugin } from "./middleware/htmx/htmx";
import { state } from "./game/state";

export const basePluginSetup = () => {
  return new Elysia({
    serve: {
      reusePort: true,
    },
  })
    .state("state", state)
    .use(htmlPlugin())
    .use(htmxPlugin());
};
