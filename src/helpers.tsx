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
  return Math.abs(date1.getTime() - date2.getTime());
}

export function diffNow(date: Date) {
  return diffDates(new Date(), date);
}

/**
 * Generate random non-overlapping colors.
 * Should prioritize colors that are easy to distinguish.
 * Given index returns one color.
 */
export function randomColor(index: number) {
  const colors = [
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
      class: "text-blue-400",
      hex: "#60a5fa",
    },
    {
      class: "text-rose-400",
      hex: "#fb7185",
    },
  ];

  // If index overflows, loop back around
  return colors[index % colors.length];
}
