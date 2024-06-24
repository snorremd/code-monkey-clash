import autoAnimate from "@formkit/auto-animate";
import * as htmx from "htmx.org";
import { CmcCounter } from "./counter";

customElements.define("cmc-counter", CmcCounter);

htmx.onLoad(() => {
  // Find all elements with the auto-animate class and animate them
  for (const element of Array.from(
    document.querySelectorAll(".auto-animate")
  )) {
    console.log("Auto animating element", element);
    autoAnimate(element as HTMLElement);
  }
});
