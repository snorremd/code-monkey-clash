/**
 * Not all answers player has answers to a portion of the questions.
 * Otherwise mirrors the other players.
 */

import { gameQuestions } from "../src/game/questions";

// Get port from Bun command line arguments
// biome-ignore lint/complexity/useLiteralKeys: <explanation>
const port = Number.parseInt(Bun.env["CMC_PLAYER_PORT"] ?? "3001", 10);

// Pick a random subset of the questions between
// 1/2 to 3/4 of the questions.
const questions = gameQuestions.filter(() => Math.random() < 0.75);

const questionFrequency: {
  [question: string]: { after: number; seen: number };
} = {};

const server = Bun.serve({
  port,
  fetch(request) {
    const q = new URL(request.url).searchParams.get("q") ?? "";
    const question = questions.find((question) => question.match(q));
    if (!question) {
      return new Response("I don't know the answer to this question");
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
