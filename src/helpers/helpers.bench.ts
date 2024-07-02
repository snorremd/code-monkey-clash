import { bench, run } from "mitata";
import { diffNow, formatDuration, playerColor, splitArrayAt } from "./helpers";

bench("diffNow", () => {
	diffNow(new Date());
});

bench("formatDuration", () => {
	formatDuration(12 * 60 * 60 * 1000 + 30 * 60 * 1000 + 15 * 1000);
});

bench("playerColor", () => {
	playerColor(10);
});

const longArray = Array.from({ length: 1000 }, (_, i) => i);

bench("splitArrayAt", () => {
	splitArrayAt(longArray, (value) => value === 500);
});

run();
