import { describe, expect, it } from "bun:test";
import { adjustQuestionInterval, maxPositiveTrendInterval } from "./game";

describe("game", () => {
  describe("adjustQuestionInterval", () => {
    // Add tests for adjustQuestionInterval
    it("should increase time between questions if player has a very positive trend", () => {
      const scores = Array(20).fill(1);
      const interval = 5000;
      const result = adjustQuestionInterval(interval, scores);
      expect(result).toBe(6000);
    });

    it("should not increase time between quetions above maxPositiveTrendInterval", () => {
      const scores = Array(20).fill(1);
      const interval = maxPositiveTrendInterval;
      const result = adjustQuestionInterval(interval, scores);
      expect(result).toBe(maxPositiveTrendInterval);
    });

    it("should increase time between questions quickly if player has a negative trend", () => {
      const scores = Array(20).fill(-1);
      const interval = 13000;
      const result = adjustQuestionInterval(interval, scores);
      expect(result).toBe(15000);
    });

    it("should decrease time between questions if player has a moderately positive trend", () => {
      const scores = Array(20).fill(0);
      scores[0] = 1;
      const interval = 10000;
      const result = adjustQuestionInterval(interval, scores);
      expect(result).toBe(9000);
    });

    it("should not adjust interval if there are no scores", () => {
      const scores: number[] = [];
      const interval = 10000;
      const result = adjustQuestionInterval(interval, scores);
      expect(result).toBe(10000);
    });
  });
});
