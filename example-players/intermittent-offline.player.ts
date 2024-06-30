// Simplest bun server that answers the root route and reads the query string

import { solutions } from "./solutions";

// Get port from Bun command line arguments
// biome-ignore lint/complexity/useLiteralKeys: <explanation>
const port = Number.parseInt(Bun.env["CMC_PLAYER_PORT"] ?? "3001", 10);

let offline = true;

function toggleOffline() {
  offline = !offline;
  setTimeout(() => {
    toggleOffline();
    // Stay offline for at most 5 seconds, then go online for up to 20 seconds
  }, Math.random() * (offline ? 5000 : 20000));
}

toggleOffline();

const server = Bun.serve({
  port,
  fetch(request) {
    if (offline) {
      console.log("I am offline!");
      return new Response("Server is offline", { status: 503 });
    }

    const q = new URL(request.url).searchParams.get("q") ?? "";
    const solution = solutions.find((s) => s.match(q));
    console.log("New request", new Date(), q, solution?.solve(q));
    return new Response(solution?.solve(q)?.toString() ?? "");
  },
});

console.log(`Listening on localhost:${server.port}`);
