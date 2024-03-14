import { expect, test } from "bun:test";

import { uppercase } from "./questions";

test("uppercase", async () => {
  const question = uppercase.question();
  expect(question).toBeString();
  const answer = uppercase.correctAnswer(question);
})
