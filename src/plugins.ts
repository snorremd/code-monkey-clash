import { Elysia } from "elysia";
import { state } from "./game/state";
import { htmlPlugin } from "./middleware/html/html";
import { htmxPlugin } from "./middleware/htmx/htmx";

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
