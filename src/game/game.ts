import type { State } from "./state";
import { type Question, gameQuestions, testQuestions } from "./questions";

// Specify intervals in milliseconds to make it easier to work with time

export const defaultInterval = 5000;
export const minInterval = 2000;
export const maxInterval = 20000;
export const intervalStep = 100;

/**
 * Adjust player question interval/rate based solely on last answer.
 * If player answered correctly, decrease interval to ask questions more frequently.
 * If player answered incorrectly, increase interval to ask questions less frequently.
 * If player answered with no points, keep interval the same.
 *
 * @param interval the current interval between questions
 * @param points the points the player received for the last question
 * @returns the new interval between questions
 */
export function adjustIntervalLinear(interval: number, points: number) {
  // Player answered correctly, increase interval
  if (points > 0) {
    return Math.max(interval - intervalStep, minInterval);
  }

  // Player answered incorrectly, decrease interval
  if (points < 0) {
    return Math.min(interval + intervalStep, maxInterval);
  }

  // Player answered with no points, keep interval the same
  return interval;
}

type QuestionInput =
  | string
  | number
  | number[]
  | [number, number]
  | [number[], number]; // Adjust based on actual types

export type QuestionType = Question<QuestionInput>;

/**
 * Given the current round and game mode, return a random question.
 * For each round the sliding window is at most 4 questions wide and jumps by 2.
 * The window initially starts smaller which helps players not get overwhelmed.
 * Window goes like this:
 *
 * 1: 1,
 *
 * 2: 1, 2, 3
 *
 * 3: 2, 3, 4, 5
 *
 * 4: 4, 5, 6, 7
 *
 * 5: 6, 7, 8, 9
 * ...
 */
export function roundToQuestion({
  round,
  mode,
}: Pick<State, "round" | "mode">): QuestionType {
  const questions = mode === "demo" ? testQuestions : gameQuestions;
  const windowEnd = round * 2 - 1;
  const windowStart = Math.max(windowEnd - 4, 0);
  const availableQuestions = questions.slice(windowStart, windowEnd);
  return availableQuestions[
    Math.floor(Math.random() * availableQuestions.length)
  ] as QuestionType; // TODO: Type casting necessary as generic Question stuff is not quite inferrable
}
