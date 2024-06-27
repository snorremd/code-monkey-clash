import { HTMLLayout, HXLayout } from "../../layouts/main";
import { basePluginSetup } from "../../plugins";
import type { Player } from "../../game/state";
import { createSSEResponse } from "../../middleware/sse/sse";
import type { ChartConfiguration } from "chart.js";

const PlayerRow = ({ player }: { player: Player }) => {
  return (
    <li
      class="flex flex-row justify-between bg-base-300 px-4 py-2 rounded-2xl bg-opacity-30 shadow-lg z-1"
      id={`player-${player.uuid}`}
    >
      <h2 class={`text-xl ${player.color.class}`} safe>
        {player.nick}
      </h2>
      <span
        class="text-2xl"
        hx-swap="innerHTML"
        sse-swap={`player-score-${player.uuid}`}
      >
        {player.log[0]?.score ?? 0}
      </span>
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
      class="auto-animate flex flex-col gap-2 z-10 bg-opacity-80 backdrop-blur-sm drop-shadow-lg"
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
        return {
          label: player.nick,
          pointRadius: 0,
          backgroundColor: player.color.hex,
          data: player.log.map((log) => ({
            x: log.date,
            y: log.score,
          })),
          borderColor: player.color.hex,
          borderWidth: 2,
          fill: false,
          tension: 0.1,
        };
      }
    );

    return (
      <Layout page="User">
        <div
          class="grid pt-32 -mt-16 relative"
          hx-ext="sse"
          sse-connect="/scoreboard/sse"
        >
          <div class="flex flex-col max-w-[300px]">
            <h1 class="text-2xl hidden">Players</h1>
            <PlayerList players={state.players} />
          </div>
          <div class="chart-container min-h-screen min-w-screen absolute inset-0 pt-12">
            <canvas id="score-board-chart" />
          </div>
        </div>
        <script>
          {htmx.is
            ? `htmx.on('htmx:afterSettle', () => renderChart(${JSON.stringify(
                datasets
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
              event: `player-score-${event.uuid}`,
              data: `${event.log.score}`,
            },
          ];
        }

        return [];
      },
    ]);
  });
