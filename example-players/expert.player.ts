/**
 * Expert player has answers to all questions.
 * To simulate a real player wait some time after
 * first seeing a question before answering it!
 */

import { gameQuestions } from "../src/game/questions";

// Get port from Bun command line arguments
// biome-ignore lint/complexity/useLiteralKeys: <explanation>
const port = Number.parseInt(Bun.env["CMC_PLAYER_PORT"] ?? "3001", 10);
const minute = 60000;

const questionSeen: {
  [question: string]: { until: number };
} = {};

const server = Bun.serve({
  port,
  fetch(request) {
    const q = new URL(request.url).searchParams.get("q") ?? "";
    const question = gameQuestions.find((question) => question.match(q));
    if (!question) {
      return new Response("Invalid question");
    }

    if (!questionSeen[q]) {
      questionSeen[q] = {
        // Wait between 5 and 10 minutes before answering a question for the first time
        until: Date.now() + Math.floor(Math.random() * minute * 3) + minute,
      };
    }

    if (questionSeen[q].until > Date.now()) {
      return new Response("I need more time to think...");
    }

    const answer = question.solve(q);

    return new Response(answer);
  },
});

console.log(`Listening on localhost:${server.port}`);
