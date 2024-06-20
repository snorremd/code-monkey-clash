import { Elysia } from "elysia";
import { bench, group, run } from "mitata";
import { htmxPlugin } from "./htmx";

// Setup app for benchmarking, empty route to avoid time spent on handling requests
const app = new Elysia({ name: "htmx" }).use(htmxPlugin()).get("*", () => {});
const locationApp = new Elysia({ name: "htmx" })
  .use(htmxPlugin())
  .get("/location", ({ htmx }) => {
    htmx.location("/new-location");
  });

// Benchmark the time it takes to create a new htmx instance
bench("create htmx instance", () => {
  htmxPlugin();
});

// Benchmark the time it takes to handle a request
bench("read request headers", () => {
  app.handle(
    new Request("http://localhost/", { headers: { "HX-Request": "true" } })
  );
});

// Benchmark the time it takes to set the location header
bench("set location header", () => {
  locationApp.handle(new Request("http://localhost/location"));
});

// Run the benchmarks
await run();
