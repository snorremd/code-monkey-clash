import { Elysia } from "elysia";
import { htmlPlugin } from "./middleware/html/html";
import { htmxPlugin } from "./middleware/htmx/htmx";
import { statePlugin } from "./middleware/state/state";

export const basePluginSetup = () => {
  return new Elysia({
    serve: {
      reusePort: true,
    },
  })
    .use(htmlPlugin())
    .use(statePlugin())
    .use(htmxPlugin());
};
