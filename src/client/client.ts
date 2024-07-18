import autoAnimate from "@formkit/auto-animate";
import {
	Chart,
	type ChartConfiguration,
	type Point,
	registerables,
} from "chart.js";
import * as htmx from "htmx.org";
import "chartjs-adapter-date-fns";
import { CmcCounter } from "./counter";

// First some type overrides
declare global {
	interface Window {
		htmx: typeof htmx;
	}
}

// Then we register some chart plugins and web components
Chart.register(...registerables);
customElements.define("cmc-counter", CmcCounter);

// Then define some functions to sort the scoreboard and render the chart
function sortScoreboard() {
	const list = document.getElementById("scoreboard-list");
	if (!list) {
		return;
	}

	const items = Array.from(list.children);

	items.sort((a, b) => {
		const scoreA = Number.parseInt(
			a.querySelector("span")?.innerText ?? "0",
			10,
		);
		const scoreB = Number.parseInt(
			b.querySelector("span")?.innerText ?? "0",
			10,
		);

		const randomNumberBetweenMinus1And1 = Math.random() * 2 - 1;
		return scoreB - (scoreA + randomNumberBetweenMinus1And1); // Sort descending order (highest score first)
	});

	// Clear the list and re-append sorted items
	list.innerHTML = "";
	for (const item of items) {
		list.appendChild(item);
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

	for (const dataset of chart.data.datasets) {
		dataset.data = dataset.data.filter((point) => {
			const x = (point as Point).x;
			console.log("X", now - x < 5 * 60 * 1000);
			return now - x < 5 * 60 * 1000;
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

htmx.onLoad(() => {
	// Find all elements with the auto-animate class and animate them
	for (const element of Array.from(
		document.querySelectorAll(".auto-animate"),
	)) {
		autoAnimate(element as HTMLElement);
	}
});

// On SSE messages do DOM-manipulation where necessary
htmx.on("htmx:sseMessage", (evt) => {
	// If player score changes sort the scoreboard
	if (
		evt instanceof CustomEvent &&
		evt.detail.type.startsWith("player-score-")
	) {
		// Sort the scoreboard when a player's score changes
		sortScoreboard();
	}

	// If the event is a player-score-chart event, update the chart with the new score data
	if (
		evt instanceof CustomEvent &&
		evt.detail.type.startsWith("player-score-chart-")
	) {
		const nick = evt.detail.type.replace("player-score-chart-", "");
		const data = JSON.parse(evt.detail.data);
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
});
