import { Elysia } from "elysia";

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

/**
 * Adds an onAfterHandle hook to the app that checks if the response is HTML.
 * If it is, it sets the content-type header to text/html and adds a doctype.
 * We only ever render HTML to string, so we don't need to care about streaming.
 * @returns
 */
export const htmlPlugin = () => {
  const app = new Elysia({ name: "html" })
    .derive({ as: "global" }, () => {})
    .onAfterHandle({ as: "global" }, ({ response, set }) => {
      if (isHTML(response)) {
        set.headers["content-type"] = "text/html; charset=utf-8";
        return `<!doctype html>${response}`;
      }
    });

  return app;
};
