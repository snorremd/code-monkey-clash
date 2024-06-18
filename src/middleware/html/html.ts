import { Elysia, StatusMap } from "elysia";
export * from "@kitajs/html/register";

/**
 * A super fast and simple way to check if a string is HTML
 * Check for opening and closing <tags> and if they are the same
 * @param str the response
 */
export function isHTML(str: unknown): str is string {
	if (typeof str !== "string") return false;
	const trimmed = str.trim();

	return (
		trimmed.length >= 7 &&
		trimmed[0] === "<" &&
		trimmed[trimmed.length - 1] === ">"
	);
}

export const html = () => {
	const app = new Elysia({ name: "html" })
		.derive({ as: "global" }, ({ body, set }) => {})
		.onAfterHandle({ as: "global" }, ({ response, set }) => {
			if (isHTML(response)) {
				set.headers["content-type"] = "text/html; charset=utf-8";
				return `<!doctype html>${response}`;
			}
		});

	return app;
};
