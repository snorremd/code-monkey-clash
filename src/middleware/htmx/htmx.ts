import Elysia from "elysia";

/**
 * The hx-swap attribute allows you to specify how the response will be swapped in relative to the target of an AJAX request.
 * If you do not specify the option, the default is htmx.config.defaultSwapStyle (innerHTML).
 */
type HtmxSwap =
  | "innerHTML" // Replace the inner html of the target element
  | "outerHTML" // Replace the entire target element with the response
  | "textContent" // Replace the text content of the target element, without parsing the response as HTML
  | "beforebegin" // Insert the response before the target element
  | "afterbegin" // Insert the response before the first child of the target element
  | "beforeend" // Insert the response after the last child of the target element
  | "afterend" // Insert the response after the target element
  | "delete" // Deletes the target element regardless of the response
  | "none"; // Does not append content from response (out of band items will still be

export type Htmx = Readonly<{
  /** Corresponds to HX-Request */
  is: boolean;
  /** HX-Boosted: indicates that the request is via an element using hx-boost */
  boosted: boolean;
  /** HX-Current-URL: the current URL of the browser */
  currentUrl: string | null;
  /** HX-History-Restore-Request: “true” if the request is for history restoration after a miss in the local history cache */
  historyRestoreRequest: boolean;
  /** HX-Prompt: the user response to an hx-prompt */
  prompt: string | null;
  /** HX-Request: always “true” */
  request: boolean;
  /** HX-Target: the id of the target element if it exists */
  target?: string | null;
  /** HX-Trigger-Name: the name of the triggered element if it exists */
  triggerName?: string | null;
  /** HX-Trigger: the id of the triggered element if it exists */
  triggerId?: string | null;

  /** HX-Location: allows you to do a client-side redirect that does not do a full page reload */
  location: (url: string) => void;
  /** HX-Push-Url: pushes a new url into the history stack */
  pushUrl: (url: string) => void;
  /** HX-Redirect: can be used to do a client-side redirect to a new location */
  redirect: (url: string) => void;
  /** HX-Refresh: if set to “true” the client-side will do a full refresh of the page */
  refresh: () => void;
  /** HX-Replace-Url: replaces the current URL in the location bar */
  replaceUrl: (url: string) => void;
  /** HX-Reswap: allows you to specify how the response will be swapped. See hx-swap for possible values */
  reswap: (value: HtmxSwap) => void;
  /** HX-Retarget: a CSS selector that updates the target of the content update to a different element on the page */
  retarget: (selector: string) => void;
  /** HX-Reselect: a CSS selector that allows you to choose which part of the response is used to be swapped in. Overrides an existing hx-select on the triggering element */
  reselect: (selector: string) => void;
  /** HX-Trigger: allows you to trigger client-side events */
  trigger: (event: string | Record<string, unknown>) => void;
  /** HX-Trigger-After-Settle: allows you to trigger client-side events after the settle step */
  triggerAfterSettle: (event: string | Record<string, unknown>) => void;
  /** HX-Trigger-After-Swap: allows you to trigger client-side events after the swap step */
  triggerAfterSwap: (event: string | Record<string, unknown>) => void;
}>;

export const htmx = () => {
  const app = new Elysia({ name: "htmx" }).derive(
    { as: "global" },
    ({ request: { headers }, set }) => {
      return {
        htmx: {
          // Request header values convenience properties
          is: headers.get("HX-Request") === "true",
          boosted: headers.get("HX-Boosted") === "true",
          currentUrl: headers.get("HX-Current-URL"),
          historyRestoreRequest:
            headers.get("HX-History-Restore-Request") === "true",
          prompt: headers.get("HX-Prompt"),
          request: headers.has("HX-Request"),
          target: headers.get("HX-Target"),
          triggerName: headers.get("HX-Trigger-Name"),
          triggerId: headers.get("HX-Trigger"),

          // Set response headers with convenience functions
          location: (url: string) => {
            set.headers["HX-Location"] = url;
          },
          pushUrl: (url: string) => {
            set.headers["HX-Push-Url"] = url;
          },
          redirect: (url: string) => {
            set.headers["HX-Redirect"] = url;
          },
          refresh: () => {
            set.headers["HX-Refresh"] = "true";
          },
          replaceUrl: (url: string) => {
            set.headers["HX-Replace-Url"] = url;
          },
          reswap: (value: HtmxSwap) => {
            set.headers["HX-Reswap"] = value;
          },
          retarget: (selector: string) => {
            set.headers["HX-Retarget"] = selector;
          },
          reselect: (selector: string) => {
            set.headers["HX-Reselect"] = selector;
          },
          trigger: (event: string | Record<string, unknown>) => {
            set.headers["HX-Trigger"] =
              typeof event === "string" ? event : JSON.stringify(event);
          },
          triggerAfterSettle: (event: string | Record<string, unknown>) => {
            headers.set(
              "HX-Trigger-After-Settle",
              typeof event === "string" ? event : JSON.stringify(event)
            );
          },
          triggerAfterSwap: (event: string | Record<string, unknown>) => {
            headers.set(
              "HX-Trigger-After-Swap",
              typeof event === "string" ? event : JSON.stringify(event)
            );
          },
        } satisfies Htmx,
      };
    }
  );

  return app;
};
