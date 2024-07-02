import { bench, group, run } from "mitata";
import { adjustQuestionInterval } from "./game";

// Don't include score generation in benchmark
const positiveTrend = Array(200).fill(1);
const negativeTrend = Array(200).fill(-1);

group("adjustQuestionInterval", () => {
	bench("positive scores", () => {
		adjustQuestionInterval(15, positiveTrend);
	});
	bench("negative scores", () => {
		adjustQuestionInterval(15, negativeTrend);
	});
});

await run();
