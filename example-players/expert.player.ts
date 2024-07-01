/**
 * Expert player has answers to all questions.
 * To simulate a real player, only answer question
 * after seeing it between 2 and 5 times.
 */

import { gameQuestions } from "../src/game/questions";

// Get port from Bun command line arguments
// biome-ignore lint/complexity/useLiteralKeys: <explanation>
const port = Number.parseInt(Bun.env["CMC_PLAYER_PORT"] ?? "3001", 10);

const questionFrequency: {
  [question: string]: { after: number; seen: number };
} = {};

const server = Bun.serve({
  port,
  fetch(request) {
    const q = new URL(request.url).searchParams.get("q") ?? "";
    console.log(`Received question: ${q}`);
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
