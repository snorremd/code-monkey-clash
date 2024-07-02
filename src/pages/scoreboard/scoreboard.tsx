import type { ChartConfiguration } from "chart.js";
import type { Player } from "../../game/state";
import { splitArrayAt } from "../../helpers/helpers";
import { HTMLLayout, HXLayout } from "../../layouts/main";
import { createSSEResponse } from "../../middleware/sse/sse";
import { basePluginSetup } from "../../plugins";

const PlayerRow = ({ player }: { player: Player }) => {
	return (
		<li
			class="flex flex-row justify-between bg-base-300 px-4 py-2 rounded-2xl bg-opacity-30 shadow-lg z-1"
			id={`player-${player.nick}`}
		>
			<h2 class={`text-xl ${player.color.class}`} safe>
				{player.nick}
			</h2>
			<span
				class="text-2xl"
				hx-swap="innerHTML"
				sse-swap={`player-score-${player.nick}`}
			>
				{player.log[0]?.score ?? 0}
			</span>
			<span // Use a hidden element to swap the chart data, don't actually swap json into the DOM
				class="hidden"
				sse-swap={`player-chart-${player.nick}`}
				hx-swap="none"
			/>
		</li>
	);
};

interface PlayerTableProps {
	players: Player[];
}

const PlayerList = ({ players }: PlayerTableProps) => {
	return (
		<ul
			id="scoreboard-list"
			class="auto-animate flex flex-col gap-2 z-10 bg-opacity-80 backdrop-blur-sm drop-shadow-lg max-h-[80vh] overflow-y-scroll scrollbar-w-none"
		>
			{players.map((player) => (
				// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
				<PlayerRow player={player} />
			))}
		</ul>
	);
};

export const scoreboardPlugin = basePluginSetup()
	.get("/scoreboard", ({ htmx, store: { state } }) => {
		const Layout = htmx.is ? HXLayout : HTMLLayout;

		const datasets: ChartConfiguration["data"]["datasets"] = state.players.map(
			(player) => {
				const last5Minutes = splitArrayAt(
					player.log,
					(log) => log.date < Date.now() - 5 * 60 * 1000,
				)[0];
				return {
					label: player.nick,
					pointRadius: 3,
					backgroundColor: player.color.hex,
					data: last5Minutes.toReversed().map((log) => ({
						x: log.date,
						y: log.score,
					})),
					borderColor: player.color.hex,
					borderWidth: 2,
					fill: false,
					tension: 0.3,
				};
			},
		);

		return (
			<Layout page="Scoreboard">
				<div
					class="grid pt-24 -mt-16 relative max-h-full"
					hx-ext="sse"
					sse-connect="/scoreboard/sse"
				>
					<div class="flex flex-col max-w-[300px] max-h-full">
						<h1 class="text-2xl hidden">Players</h1>
						<PlayerList players={state.players} />
					</div>
					<div class="chart-container min-h-screen min-w-screen max-h-screen max-w-screen absolute inset-0 pt-24">
						<div class="epic-dark" />
						<canvas id="score-board-chart" class="relative" />
					</div>
				</div>
				<script>
					{htmx.is
						? `htmx.on("htmx:afterSettle", () => renderChart(${JSON.stringify(
								datasets,
							)}))`
						: `renderChart(${JSON.stringify(datasets)})`}
				</script>
			</Layout>
		);
	})
	.get("/scoreboard/sse", ({ store: { state }, request }) => {
		return createSSEResponse(state, request, [
			(_, event) => {
				if (event.type === "player-answer") {
					return [
						{
							event: `player-score-${event.nick}`,
							data: `${event.log.score}`,
						},
						{
							event: `player-chart-${event.nick}`,
							data: JSON.stringify({
								x: new Date(event.log.date).toISOString(),
								y: event.log.score,
							}),
						},
					];
				}

				return [];
			},
		]);
	});
