import { t } from "elysia";
import { nanoid } from "nanoid";
import { escape as htmlEscape } from "html-escaper";
import { HTMLLayout, HXLayout } from "../layouts/main";
import { basePluginSetup } from "../plugins";
import type { Player, State, PlayerLog } from "../game/state";

interface PlayerLayoutProps {
  state: State;
  player: Player;
}

interface PlayerStatsProps extends PlayerLayoutProps {
  log?: PlayerLog;
}

const PlayerStats = ({ state, player, log }: PlayerStatsProps) => {
  const { round } = state;

  return (
    <div
      id="counter"
      class="rounded-2xl z-10 bg-base-100 bg-opacity-80 backdrop-blur-sm drop-shadow-lg stats stats-horizontal text-2xl max-w-full"
      sse-swap="stats"
      hx-swap="outerHTML"
    >
      <div class="stat place-items-center">
        <span class="stat-title">Nick</span>
        <span class="stat-value" safe>
          {player.nick}
        </span>
      </div>
      <div class="stat place-items-center">
        <span class="stat-title">Round</span>
        <span class="stat-value">{round}</span>
      </div>
      <div class="stat place-items-center">
        <span class="stat-title">Score</span>
        <span class="stat-value">{log?.score ?? 0}</span>
      </div>
      <div class="stat place-items-center">
        <span class="stat-title">Questions</span>
        <span class="stat-value">{log?.id ?? 0}</span>
      </div>
      <div class="stat place-items-center">
        <span class="stat-title">Answer ratio</span>
        <span class="stat-value">
          {Number.isNaN(log?.answerRatio ?? 0) ? "N/A" : log?.answerRatio}
        </span>
      </div>
    </div>
  );
};

export const PlayerControl = ({ player }: { player: Player }) => {
  return (
    <form class="z-10 flex flex-row items-center" method="POST" action="">
      {player.playing ? (
        <button
          class="btn btn-outline btn-error"
          type="submit"
          hx-post={`/players/${player.uuid}/surrender`}
          hx-swap="outerHTML"
          hx-target="#control"
        >
          Surrender
        </button>
      ) : (
        <button
          class="btn btn-outline btn-success"
          type="submit"
          hx-post={`/players/${player.uuid}/play`}
          hx-swap="outerHTML"
          hx-target="#control"
        >
          Rejoin
        </button>
      )}
    </form>
  );
};

const QuestionTableRow = ({ log }: { log: PlayerLog }) => {
  return (
    <tr class="odd:bg-base-300" id={`log-${log.id}`}>
      <th safe>{new Date(log.date).toLocaleTimeString()}</th>
      <td safe>{log.question}</td>
      <td>
        {log.answer ? (
          <span safe class={`${log.score > 0 ? "text-success" : "text-error"}`}>
            {htmlEscape(log.answer).substring(0, 500)}
          </span>
        ) : (
          "N/A"
        )}
      </td>
      <td>{log.statusCode ?? "N/A"}</td>
      <td>{log.error ? <span class="text-error">{log.error}</span> : null}</td>
      <td>{(log.questionInterval ?? 0) / 1000}</td>
      <td>{log.points}</td>
      <td>{log.score}</td>
    </tr>
  );
};

const QuestionTable = (player: Player) => {
  return (
    <div class="rounded-2xl z-10 bg-base-100 p-8 bg-opacity-80 backdrop-blur-sm drop-shadow-lg flex flex-col grow overflow-x-auto min-h-full">
      <table class="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Question</th>
            <th>Answer</th>
            <th>HTTP</th>
            <th>Error</th>
            <th>Question rate</th>
            <th>Points</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody class="auto-animate" sse-swap="log" hx-swap="afterbegin">
          {
            // For performance reasons, only show the last 50 logs
            player.log.slice(0, 50).map((log) => (
              // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
              <QuestionTableRow log={log} />
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export const PlayerLayout = ({ player, state }: PlayerLayoutProps) => {
  return (
    <div
      class="epic flex flex-col grow gap-8 pt-8"
      hx-ext="sse"
      sse-connect={`/players/${player.uuid}/sse`}
    >
      <PlayerStats player={player} state={state} log={player.log[0]} />
      <QuestionTable {...player} />
    </div>
  );
};

export const plugin = basePluginSetup()
  .get(
    "/players/:uuid",
    ({ htmx, params: { uuid }, store: { state } }) => {
      const Layout = htmx.is ? HXLayout : HTMLLayout;
      const player = state.players.find((p) => p.uuid === uuid);

      if (!player) {
        return (
          <Layout page="User">
            <div class="flex flex-col">
              <h1 class="">Player not found</h1>
              <p>
                <a class="link link-success" href="/signup">
                  Create a new player
                </a>{" "}
                to compete.
              </p>
            </div>
          </Layout>
        );
      }

      return (
        <Layout page="User" header={<PlayerControl player={player} />}>
          <PlayerLayout state={state} player={player} />
        </Layout>
      );
    },
    {
      params: t.Object({
        uuid: t.String(),
      }),
    }
  )
  .get(
    "/players/:uuid/sse",
    ({ params: { uuid }, set, store: { state }, request }) => {
      const player = state.players.find((p) => p.uuid === uuid);

      if (!player) {
        // No player found, so return 404
        console.error("Player not found", uuid);
        set.status = 404;
        return;
      }

      console.log("Establish SSE connection for player", player?.nick ?? uuid);

      const id = nanoid();

      // TODO: Implement lower level SSE to be able to clean up listeners
      // when http client disconnects https://github.com/oven-sh/bun/issues/2443#issuecomment-1952993837
      const stream = new ReadableStream({
        start(controller) {
          state.playerLogListeners[id] = {
            playerId: player.uuid,
            cb: (log) => {
              controller.enqueue(
                `id: ${nanoid()}\nevent: log\ndata: ${(
                  <QuestionTableRow log={log} />
                )}\n\n`
              );

              controller.enqueue(
                `id: ${nanoid()}\nevent: stats\ndata: ${(
                  <PlayerStats state={state} player={player} log={log} />
                )}\n\n`
              );
            },
          };

          // If the http client disconnects, we need to clean up the listener
          request.signal.onabort = () => {
            console.log("SSE connection aborted");
            if (state.playerLogListeners[id]) {
              delete state.playerLogListeners[id];
            }
            controller.close();
          };
        },
        cancel() {
          console.log("SSE connection closed");
          if (state.playerLogListeners[id]) {
            delete state.playerLogListeners[id];
          }
        },
      });

      set.status = 200;
      set.headers["Content-Type"] = "text/event-stream";
      set.headers["Cache-Control"] = "no-cache";
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      set.headers["Connection"] = "keep-alive";

      return new Response(stream);
    }
  );
