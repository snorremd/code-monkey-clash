import { describe, expect, it } from "bun:test";
import {
	adjustIntervalLinear,
	defaultInterval,
	intervalStep,
	maxInterval,
} from "./game";

describe("game", () => {
	describe("adjustIntervalLinear", () => {
		// Add tests for adjustQuestionInterval
		it("should increase time between questions if wrong answer (negative points)", () => {
			const interval = defaultInterval;
			const result = adjustIntervalLinear(interval, -2);
			expect(result).toBe(defaultInterval + intervalStep);
		});

		it("should not increase time between quetions above maxInterval", () => {
			const interval = maxInterval;
			const result = adjustIntervalLinear(interval, -2);
			expect(result).toBe(maxInterval);
		});

		it("should decrease time between questions if correct answer (positive points)", () => {
			const interval = defaultInterval;
			const result = adjustIntervalLinear(interval, +2);
			expect(result).toBe(defaultInterval - intervalStep);
		});

		it("should not adjust interval if points is 0", () => {
			const interval = defaultInterval;
			const result = adjustIntervalLinear(interval, 0);
			expect(result).toBe(defaultInterval);
		});
	});
});
