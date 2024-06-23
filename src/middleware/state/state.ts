import { Elysia } from "elysia";
import { state } from "../../game/state";

export const statePlugin = () => {
  const app = new Elysia({ name: "html" }).state("state", state);

  return app;
};
