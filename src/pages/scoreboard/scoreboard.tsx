import type { ChartConfiguration } from "chart.js";
import type { Player, State } from "../../game/state";
import { splitArrayAt } from "../../helpers/helpers";
import { HTMLLayout, HXLayout } from "../../layouts/main";
import { createSSEResponse } from "../../middleware/sse/sse";
import { basePluginSetup } from "../../plugins";

const PlayerRow = ({ player }: { player: Player }) => {
	return (
		<li
			class="flex flex-row justify-between bg-base-300 px-4 py-2 rounded-2xl bg-opacity-30 shadow-lg z-1"
			id={`player-${player.nick}`}
			sse-swap={`player-left-${player.nick}`}
			hx-swap="delete"
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
				sse-swap={`player-score-chart-${player.nick}`}
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
			sse-swap="player-joined"
			hx-swap="afterbegin"
		>
			{players.map((player) => (
				// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
				<PlayerRow player={player} />
			))}
		</ul>
	);
};

const GameStatus = ({ status }: { status: State["status"] }) => {
	return (
		<div
			class={`z-10 flex backdrop-blur-sm p-16 rounded ${status === "playing" ? "hidden" : ""}`}
			sse-swap="game-status"
			hx-swap="outerHTML"
		>
			{status !== "ended" ? (
				<span class="text-9xl capitalize">{status}</span>
			) : (
				<meta http-equiv="refresh" content="0; url=/scoreboard/winners" />
			)}
		</div>
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
					<div class="min-h-screen min-w-screen max-h-screen max-w-screen absolute inset-0 pt-24 flex flex-col items-center text-center justify-center">
						<GameStatus status={state.status} />
					</div>
					<span // Use a hidden element to swap the chart data, don't actually swap json into the DOM
						class="hidden"
						sse-swap="player-joined-chart"
						hx-swap="none"
					/>
					<span class="hidden" sse-swap="player-left-chart" hx-swap="none" />
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
	.get("/scoreboard/winners", ({ htmx, store: { state } }) => {
		const Layout = htmx.is ? HXLayout : HTMLLayout;
		const winners = state.players
			.toSorted((a, b) => (b.log[0]?.score ?? 0) - (a.log[0]?.score ?? 0))
			.slice(0, 3);
		const medals = ["🥇", "🥈", "🥉"];
		return (
			<Layout page="Winner">
				<div
					class="epic min-w-full max-h-full flex flex-col grow items-center justify-center"
					hx-target="#main"
				>
					<canvas id="confetti" class="absolute inset-0 w-screen h-screen" />
					<div class="z-10 flex flex-col items-center text-center justify-center backdrop-blur-md p-16">
						<ol class="list-none text-start flex flex-col gap-8">
							{winners.map((player, i) => (
								// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
								<li
									class={`text-8xl ${player.color.class} min-w-full flex flex-row gap-8 justify-between`}
								>
									<span safe>
										{medals[i]} {player.nick}
									</span>{" "}
									<span>{player.score}</span>
								</li>
							))}
						</ol>
					</div>
				</div>
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
							event: `player-score-chart-${event.nick}`,
							data: JSON.stringify({
								x: new Date(event.log.date).toISOString(),
								y: event.log.score,
							}),
						},
					];
				}

				if (event.type === "player-joined") {
					const player = state.players.find((p) => p.uuid === event.uuid);
					return player
						? [
								{
									event: "player-joined",
									data: `${<PlayerRow player={player} />}`,
								},
								{
									// Pass chart data config as SSE event
									event: "player-joined-chart",
									data: JSON.stringify({
										label: player.nick,
										pointRadius: 3,
										backgroundColor: player.color.hex,
										data: [
											{
												x: new Date().toISOString(),
												y: player.log[0]?.score ?? 0,
											},
										],
										borderColor: player.color.hex,
										borderWidth: 2,
										fill: false,
										tension: 0.3,
									}),
								},
							]
						: [];
				}

				if (event.type === "player-left") {
					return [
						{
							event: `player-left-${event.nick}`,
						},
						{
							event: "player-left-chart",
							data: JSON.stringify({ nick: event.nick }),
						},
					];
				}

				const gameStatusEvents = [
					"game-started",
					"game-stopped",
					"game-paused",
					"game-continued",
					"game-ended",
				];

				if (gameStatusEvents.includes(event.type)) {
					return [
						{
							event: "game-status",
							data: `${<GameStatus status={state.status} />}`,
						},
					];
				}

				return [];
			},
		]);
	});
