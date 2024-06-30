// Simplest bun server that answers the root route and reads the query string

import { solutions } from "./solutions";

// Get port from Bun command line arguments
// biome-ignore lint/complexity/useLiteralKeys: <explanation>
const port = Number.parseInt(Bun.env["CMC_PLAYER_PORT"] ?? "3001", 10);

const server = Bun.serve({
  port,
  fetch(request) {
    const q = new URL(request.url).searchParams.get("q") ?? "";
    const solution = solutions.find((s) => s.match(q));

    console.log("New request", new Date(), q, solution?.solve(q));

    return new Response(solution?.solve(q)?.toString() ?? "");
  },
});

console.log(`Listening on localhost:${server.port}`);
