import { Elysia } from "elysia";
import { bench, group, run } from "mitata";
import { html } from "./html";

// Setup app for benchmarking, empty route to avoid time spent on handling requests
const app = new Elysia({ name: "html" }).use(html()).get("*", () => {});

// Benchmark the time it takes to create a new html instance
bench("create html instance", () => {
	html();
});

// Benchmark the time it takes to handle a request
bench("read request headers", async () => {
	await app.handle(
		new Request("http://localhost/", { headers: { "HX-Request": "true" } }),
	);
});

// Run the benchmarks
await run();