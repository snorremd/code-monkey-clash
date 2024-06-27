import type { State } from "./state";
import { type Question, gameQuestions, testQuestions } from "./questions";

// Specify intervals in milliseconds to make it easier to work with time
export const defaultInterval = 10000;
const minInterval = 5000;
const maxInterval = 20000;
const maxPositiveTrendInterval = 8000;
const intervalStep = 1000;

/**
 * Adjust player question interval based on historical performance.
 * Look at last 20 scores to determine if player has negative or positive trend.
 * If player has a very positive trend, reduce question interval.
 * If player has a negative trend, decrease question interval quickly so they don't get discouraged.
 * If player has moderately positive trend (recovering), increase question interval again.
 * @param interval
 * @param scores
 * @returns
 */
export function adjustQuestionInterval(interval: number, scores: number[]) {
  // Calculate average score last 15 questions
  const lastScores = scores.slice(0, 20);

  if (lastScores.length === 0) {
    return interval;
  }

  const average =
    lastScores.reduce((acc, score) => acc + score, 0) / lastScores.length;

  if (average > 0.75) {
    // Player has a very positive trend so start reducing question interval
    // But don't go above a certain threshold to avoid punishing successful players
    return Math.min(maxPositiveTrendInterval, interval + intervalStep);
  }

  if (average >= 0) {
    // Player is recovering from a negative trend, so decrease question interval
    return Math.max(minInterval, interval - intervalStep);
  }

  // Player has a negative trend, so decrease question interval quickly
  return Math.min(maxInterval, interval + intervalStep * 2);
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
  // Pick among questions based on round, make sliding window
  const windowEnd = round * 2 - 1;
  const windowStart = Math.max(windowEnd - 4, 0);
  const availableQuestions = questions.slice(windowStart, windowEnd);
  return availableQuestions[
    Math.floor(Math.random() * availableQuestions.length)
  ] as QuestionType; // TODO: Type casting necessary as generic Question stuff is not quite inferrable
}
