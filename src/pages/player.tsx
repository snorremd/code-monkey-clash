import { t } from "elysia";
import { nanoid } from "nanoid";
import { escape as htmlEscape } from "html-escaper";
import { HTMLLayout, HXLayout } from "../layouts/main";
import { basePluginSetup } from "../plugins";
import {
  type Player,
  type State,
  plugin as statePlugin,
  type PlayerLog,
} from "../game/state";
import Stream from "@elysiajs/stream";

interface PlayerLayoutProps {
  player: Player;
  state: State;
}

const PlayerStats = ({ state, player }: PlayerLayoutProps) => {
  const correct = player.log.filter((log) => log.points > 0).length;
  const total = player.log.length;
  const ratio = correct / total;

  return (
    <div
      id="counter"
      class="rounded-2xl z-10 bg-base-100 bg-opacity-80 backdrop-blur-sm drop-shadow-lg stats stats-horizontal text-2xl max-w-full"
    >
      <div class="stat place-items-center">
        <span class="stat-title">Nick</span>
        <span class="stat-value" safe>
          {player.nick}
        </span>
      </div>
      <div class="stat place-items-center">
        <span class="stat-title">Round</span>
        <span class="stat-value">{state.round}</span>
      </div>
      <div class="stat place-items-center">
        <span class="stat-title">Score</span>
        <span class="stat-value">{player.score}</span>
      </div>
      <div class="stat place-items-center">
        <span class="stat-title">Questions</span>
        <span class="stat-value">{player.log.length}</span>
      </div>
      <div class="stat place-items-center">
        <span class="stat-title">Answer ratio</span>
        <span class="stat-value">{Number.isNaN(ratio) ? "N/A" : ratio}</span>
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
        <tbody
          class="auto-animate"
          hx-ext="sse"
          sse-connect={`/players/${player.uuid}/sse`}
          sse-swap="log"
          hx-swap="afterbegin"
        >
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
    <div class="epic flex flex-col grow gap-8 pt-8">
      <PlayerStats player={player} state={state} />
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
  .get("/players/:uuid/sse", ({ params: { uuid }, set, store: { state } }) => {
    const player = state.players.find((p) => p.uuid === uuid);
    console.log("Establish SSE connection for player", player?.nick ?? uuid);

    if (!player) {
      // No player found, so return 404
      console.error("Player not found", uuid);
      set.status = 404;
      return;
    }

    const stream = new Stream();
    const callbackId = crypto.randomUUID();

    state.playerLogListeners[callbackId] = (log) => {
      const id = nanoid();
      stream.send(
        `id: ${id}\nevent: log\ndata: ${(<QuestionTableRow log={log} />)}\n\n`
      );
    };

    set.status = 200;

    return stream;
  });
