import autoAnimate from "@formkit/auto-animate";
import {
	Chart,
	type ChartConfiguration,
	type Point,
	registerables,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { CmcCounter } from "./counter";
import { startConfetti } from "./confetti";

// Then we register some chart plugins and web components
Chart.register(...registerables);
customElements.define("cmc-counter", CmcCounter);

/**
 * Define a type for holding a map of sort functions.
 * Each function accepts two strings and returns a number.
 * The key is the name of the function.
 */
type SortFunctions = {
	[key: string]: (a: string, b: string) => number;
};

/**
 * A map of sort function implementations.
 * Allows us to sort elements on different criteria.
 * For example, we can sort elements by score or by localeCompare
 * if values are nicknames. If values are stringly numbers we
 * can sort them by the numeric value.
 */
const sortFunctions: SortFunctions = {
	score: (a, b) => Number.parseInt(b) - Number.parseInt(a),
	localeCompare: (a, b) => a.localeCompare(b),
};

/**
 * Sorts all elements with the attribute "sort".
 * The value of the attribute specifies the value in each child
 * to use for sorting. The optional attribute "sortFn" specifies
 * the name of the function to use for sorting.
 *
 * Fallbacks to "localeCompare" if the function is not found.
 * We simply remove the elements in the list and re-append them
 * in the sorted order.
 *
 * Works with auto-animate to animate the sorting.
 */
function sortSortable() {
	// First find all elements with attribute "sort"
	const sortableElements = Array.from(document.querySelectorAll("[sort]"));

	// For each sortable element we sort the children by the attribute "sortkey"
	for (const sortableElement of sortableElements) {
		const sortAttr = sortableElement.getAttribute("sort") ?? "";
		const fnName = sortableElement.getAttribute("sortFn") ?? "";
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		const sortFn = sortFunctions[fnName] ?? sortFunctions["localeCompare"];
		const items = Array.from(sortableElement.children);

		items.sort((a, b) => {
			const sortValueA = a.getAttribute(sortAttr) ?? "";
			const sortValueB = b.getAttribute(sortAttr) ?? "";
			return sortFn(sortValueA, sortValueB);
		});

		// Clear the list and re-append sorted items
		sortableElement.innerHTML = "";
		for (const item of items) {
			sortableElement.appendChild(item);
		}
	}
}

declare global {
	interface Window {
		renderChart(datasets: ChartConfiguration<"line">["data"]["datasets"]): void;
	}
}

let chart: Chart<"line">;

function cleanChart() {
	const now = new Date().getTime();
	const fiveMinutesAgo = now - 5 * 60 * 1000;

	for (const dataset of chart.data.datasets) {
		dataset.data = dataset.data.filter((point) => {
			const x = (point as Point).x;
			return x >= fiveMinutesAgo;
		});
	}
	chart.update();
}

function renderChart(datasets: ChartConfiguration<"line">["data"]["datasets"]) {
	console.log("Rendering chart with datasets", datasets);

	const ctx = document.getElementById("score-board-chart") as HTMLCanvasElement;

	if (ctx) {
		chart = new Chart<"line">(ctx, {
			type: "line",
			data: {
				datasets: datasets,
			},
			options: {
				responsive: true,
				scales: {
					x: {
						ticks: {
							color: "oklch(0.841536 0.007965 265.755)",
						},
						type: "time",
						time: {
							unit: "minute",
						},
						title: {
							display: true,
							text: "Time",
						},
					},
					y: {
						type: "linear",
						position: "right",
						suggestedMin: -10,
						suggestedMax: 10,
						ticks: {
							color: "oklch(0.841536 0.007965 265.755)",
						},
						grid: {
							color: "oklch(0.841536 0.007965 265.755 / 0.2)",
						},
					},
				},
				plugins: {
					legend: {
						display: false,
					},
					tooltip: {
						enabled: true, // This enables the tooltip
						callbacks: {
							// You can customize the tooltip content here
							label: (context) => {
								let label = context.dataset.label || "";

								if (label) {
									label += ": ";
								}
								if (context.parsed.y !== null) {
									label += context.parsed.y;
								}
								return label;
							},
						},
					},
				},
			},
		});

		// Every minute clear out old data
		setInterval(cleanChart, 60 * 1000);
		cleanChart();
		chart.update();
	}
}

window.renderChart = renderChart;

function htmxOnLoad() {
	// Find all elements with the auto-animate class and animate them
	for (const element of Array.from(
		document.querySelectorAll(".auto-animate"),
	)) {
		console.info("Auto animating", element);
		autoAnimate(element as HTMLElement);
	}

	// If the confetti canvas is present, start the confetti animation
	const confettiCanvas = document.getElementById(
		"confetti",
	) as HTMLCanvasElement | null;
	if (confettiCanvas) {
		startConfetti(confettiCanvas);
	}
}

function htmxSSEMessage(evt: Event) {
	// On SSE messages do DOM-manipulation where necessary
	sortSortable();

	// If the event is a player-score-chart event, update the chart with the new score data
	if (
		evt instanceof CustomEvent &&
		evt.detail.type.startsWith("player-score-chart")
	) {
		const { nick, ...data } = JSON.parse(evt.detail.data);
		const dataset = chart.data.datasets.find((d) => d.label === nick);

		if (dataset) {
			dataset.data.push(data);
			chart.update();
		}
	}

	// If the event is a player-joined-chart event, add the player to the chart
	if (evt instanceof CustomEvent && evt.detail.type === "player-joined-chart") {
		const data = JSON.parse(evt.detail.data);
		chart.data.datasets.push(data);
		chart.update();
	}

	// If player leaves, remove them from the chart
	if (evt instanceof CustomEvent && evt.detail.type === "player-left-chart") {
		const nick = JSON.parse(evt.detail.data).nick;
		const datasetIndex = chart.data.datasets.findIndex((d) => d.label === nick);
		if (datasetIndex !== -1) {
			chart.data.datasets.splice(datasetIndex, 1);
			chart.update();
		}
	}
}

window.onload = () => {
	console.info("Running client.ts window.onload setup function");
	document.body.addEventListener("htmx:load", htmxOnLoad);
	document.body.addEventListener("htmx:sseMessage", htmxSSEMessage);

	htmxOnLoad();
};
