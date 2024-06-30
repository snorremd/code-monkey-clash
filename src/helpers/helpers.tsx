import type { ValidationError } from "elysia";

export function mapValidationError(error: ValidationError) {
  return Object.fromEntries(error.all.map((e) => [e.path, e.message]));
}

function padWithZero(number: number) {
  return number.toString().padStart(2, "0");
}

export function formatDuration(durationInMillis: number) {
  const seconds = Math.floor((durationInMillis / 1000) % 60);
  const minutes = Math.floor((durationInMillis / (1000 * 60)) % 60);
  const hours = Math.floor(durationInMillis / (1000 * 60 * 60));

  return `${padWithZero(hours)}:${padWithZero(minutes)}:${padWithZero(
    seconds
  )}`;
}

export function diffDates(date1: Date, date2: Date) {
  return date1.getTime() - date2.getTime();
}

export function diffNow(date: Date) {
  return diffDates(new Date(), date);
}

/**
 * Split an array into two parts based on a predicate.
 * First part contains all elements before the first element that matches the predicate.
 * Second part contains all elements after the first element that matches the predicate.
 * If no elements match the predicate, the first part contains the entire array, the second part is empty.
 * Conversely, if all elements match the predicate, the first part is empty, the second part contains the entire array.
 * @param array
 * @param predicate
 * @returns [[...firstElements], [...lastElements]]
 */
export function splitArrayAt<T>(array: T[], predicate: (value: T) => boolean) {
  const firstIndex = array.findIndex(predicate);
  if (firstIndex === -1) {
    return [array, []];
  }
  return [array.slice(0, firstIndex), array.slice(firstIndex)];
}

export const playerColors = [
  {
    class: "text-red-400",
    hex: "#f87171",
  },
  {
    class: "text-green-400",
    hex: "#4ade80",
  },
  {
    class: "text-blue-400",
    hex: "#60a5fa",
  },
  {
    class: "text-rose-400",
    hex: "#fb7185",
  },
  {
    class: "text-teal-400",
    hex: "#2dd4bf",
  },
  {
    class: "text-amber-400",
    hex: "#fbbf24",
  },
  {
    class: "text-violet-400",
    hex: "#a78bfa",
  },
  {
    class: "text-emerald-400",
    hex: "#34d399",
  },
  {
    class: "text-lime-400",
    hex: "#a3e635",
  },
  {
    class: "text-cyan-400",
    hex: "#22d3ee",
  },
  {
    class: "text-fuchsia-400",
    hex: "#e879f9",
  },
  {
    class: "text-orange-400",
    hex: "#fb923c",
  },
];

/**
 * Generate random non-overlapping colors.
 * Should prioritize colors that are easy to distinguish.
 * Given index returns one color.
 */
export function playerColor(index: number) {
  // If index overflows, loop back around
  return playerColors[index % playerColors.length];
}
