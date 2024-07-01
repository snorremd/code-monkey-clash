/**
 * Intermittent offline player mirrors the expert player.
 * However it goes offline every now and then.
 * This simulates a real player that may not always be available.
 * Perhaps because the player sometimes restarts their server, or
 * need to recompile their code or something.
 */

import { gameQuestions } from "../src/game/questions";

// Get port from Bun command line arguments
// biome-ignore lint/complexity/useLiteralKeys: <explanation>
const port = Number.parseInt(Bun.env["CMC_PLAYER_PORT"] ?? "3001", 10);

const questionFrequency: {
  [question: string]: { after: number; seen: number };
} = {};

let offline = true;

function toggleOffline() {
  offline = !offline;
  setTimeout(() => {
    toggleOffline();
    // Stay offline for at most 2 seconds, then go online for up to 20 seconds
  }, Math.random() * (offline ? 2 : 30000));
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
    const question = gameQuestions.find((question) => question.match(q));
    if (!question) {
      return new Response("Invalid question");
    }

    if (!questionFrequency[q]) {
      questionFrequency[q] = {
        after: Math.floor(Math.random() * 3) + 2,
        seen: 1,
      };
    }

    if (questionFrequency[q].seen < questionFrequency[q].after) {
      questionFrequency[q].seen++;
      return new Response("I need more time to think...");
    }

    const answer = question.solve(q);

    return new Response(answer);
  },
});

console.log(`Listening on localhost:${server.port}`);
