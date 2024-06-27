import autoAnimate from "@formkit/auto-animate";
import * as htmx from "htmx.org";
import {
  Chart,
  LinearScale,
  TimeScale,
  LineController,
  PointElement,
  LineElement,
  type ChartConfiguration,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { CmcCounter } from "./counter";

Chart.register(
  LinearScale,
  TimeScale,
  LineController,
  PointElement,
  LineElement
);

declare global {
  interface Window {
    htmx: typeof htmx;
  }
}

customElements.define("cmc-counter", CmcCounter);

htmx.onLoad(() => {
  // Find all elements with the auto-animate class and animate them
  for (const element of Array.from(
    document.querySelectorAll(".auto-animate")
  )) {
    autoAnimate(element as HTMLElement);
  }
});

function sortScoreboard() {
  const list = document.getElementById("scoreboard-list");
  if (!list) {
    return;
  }

  const items = Array.from(list.children);

  items.sort((a, b) => {
    const scoreA = Number.parseInt(
      a.querySelector("span")?.innerText ?? "0",
      10
    );
    const scoreB = Number.parseInt(
      b.querySelector("span")?.innerText ?? "0",
      10
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

function renderChart(datasets: ChartConfiguration["data"]["datasets"]) {
  console.log("Rendering chart with datasets", datasets);

  const ctx = document.getElementById("score-board-chart")?.getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: datasets,
    },
    options: {
      responsive: true,
      scales: {
        x: {
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
        },
      },
    },
  });

  chart.update();
}

window.renderChart = renderChart;

htmx.on("htmx:sseMessage", (evt) => {
  if (
    evt instanceof CustomEvent &&
    evt.detail.type.startsWith("player-score-")
  ) {
    sortScoreboard();
  }

  if (evt instanceof CustomEvent && evt.detail.type === "player-log") {
  }
});
