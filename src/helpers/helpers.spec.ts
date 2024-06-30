import { describe, expect, it } from "bun:test";
import {
  diffNow,
  formatDuration,
  playerColor,
  playerColors,
  splitArrayAt,
} from "./helpers";

describe("helpers", () => {
  describe(playerColor.name, () => {
    it("should return a player color based on index", () => {
      const color = playerColor(0);
      expect(color).toBeDefined();
    });

    it("should wrap around when index is greater than the number of colors", () => {
      const index = playerColors.length + 1;
      const color = playerColor(index);
      expect(color).toBeDefined();
    });

    it("should never return the same color for two consecutive indices", () => {
      const indices = Array.from(
        { length: playerColors.length * 2 },
        (_, i) => i
      );
      const colors = indices.map(playerColor);
      // Loop through pairs of colors, checking that they are not the same
      for (let i = 0; i < colors.length - 1; i++) {
        expect(colors[i]).not.toEqual(colors[i + 1]);
      }
    });
  });

  describe("diffNow", () => {
    it("should return positive difference if now is later than date", () => {
      const date = new Date("2021-01-01T00:00:00Z");
      const diff = diffNow(date);

      expect(diff).toBeGreaterThan(0);
    });

    it("should return negative difference if date compared to now is in the future", () => {
      const date = new Date("9000-01-01T00:00:00Z");
      const diff = diffNow(date);

      expect(diff).toBeLessThan(0);
    });
  });

  describe("formatDuration", () => {
    it('should format duration as "HH:MM:SS"', () => {
      const hours = 12 * 60 * 60 * 1000;
      const minutes = 30 * 60 * 1000;
      const seconds = 15 * 1000;
      const duration = hours + minutes + seconds;

      const formatted = formatDuration(duration);
      expect(formatted).toMatch("12:30:15");
    });

    it("should fill in leading zeros for hours, minutes, and seconds", () => {
      const hours = 1 * 60 * 60 * 1000;
      const minutes = 1 * 60 * 1000;
      const seconds = 1 * 1000;
      const duration = hours + minutes + seconds;
      const formatted = formatDuration(duration);
      expect(formatted).toMatch("01:01:01");
    });

    it('should format duration as "00:00:00" for zero duration', () => {
      const duration = 0;
      const formatted = formatDuration(duration);
      expect(formatted).toMatch("00:00:00");
    });

    it('should format duration as "00:00:01" for 1 second', () => {
      const duration = 1 * 1000;
      const formatted = formatDuration(duration);
      expect(formatted).toMatch("00:00:01");
    });
  });

  describe("splitArrayAt", () => {
    it("should split array at first element that matches predicate", () => {
      const array = [1, 2, 3, 4, 5];
      const predicate = (value: number) => value === 3;
      const [first, last] = splitArrayAt(array, predicate);
      expect(first).toEqual([1, 2]);
      expect(last).toEqual([3, 4, 5]);
    });

    it("should return all elements in first part if no elements match predicate", () => {
      const array = [1, 2, 3, 4, 5];
      const predicate = (value: number) => value === 6;
      const [first, last] = splitArrayAt(array, predicate);
      expect(first).toEqual(array);
      expect(last).toEqual([]);
    });

    it("should return empty first part if all elements match predicate", () => {
      const array = [1, 2, 3, 4, 5];
      const predicate = (value: number) => value < 6;
      const [first, last] = splitArrayAt(array, predicate);
      expect(first).toEqual([]);
      expect(last).toEqual(array);
    });
  });
});
