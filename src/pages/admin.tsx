import { cookie } from "@elysiajs/cookie";
import { Elysia, type ValidationError, t } from "elysia";
import { htmx } from "elysia-htmx";
import { diffNow, formatDuration, mapValidationError } from "../helpers";
import {
  FullScreenLayout,
  HTMLLayout,
  HXLayout,
  HeroLayout,
} from "../layouts/main";
import { gameQuestions } from "../game/questions";
import {
  type State,
  removePlayer,
  plugin as statePlugin,
  startGame,
} from "../state";
import { askPlayerQuestion } from "../game/game";

interface FormProps {
  secret?: string;
  fieldErrors: Record<string, string>;
}

const AdminLoginForm = ({ fieldErrors, secret }: FormProps) => {
  return (
    <form
      class="w-full max-w-md flex flex-col gap-4"
      hx-post="/admin/login"
      hx-target="this"
      hx-swap="outerHTML"
      hx-boost
    >
      <label class="form-control w-full max-w-xs">
        <div class="label">
          <span class="label-text">What is the admin secret?</span>
        </div>
        <input
          type="password"
          name="secret"
          class="input input-bordered w-full max-w-xs"
          value={secret}
        />
        {fieldErrors["/secret"] ? (
          <div class="label-text-alt mt-2 text-error">
            {fieldErrors["/secret"]}
          </div>
        ) : null}
      </label>
      <button type="submit" class="btn btn-primary">
        Login
      </button>
    </form>
  );
};

interface RoundProps {
  state: State;
}

const Stats = ({ state }: RoundProps) => {
  const { mode } = state;
  const timeSinceGame = formatDuration(
    state.gameStartedAt ? diffNow(new Date(state.gameStartedAt)) : 0
  );
  const timeSinceRound = formatDuration(
    state.roundStartedAt ? diffNow(new Date(state.roundStartedAt)) : 0
  );
  const totalRequests = state.players.reduce(
    (acc, player) => acc + player.log.length,
    0
  );

  return (
    <div
      id="counter"
      class="stats stats-horizontal text-2xl max-w-full"
      hx-get="/admin/time"
      hx-swap="outerHTML"
      hx-trigger="every 10s"
      hx-target="this"
    >
      <div class="stat place-items-center">
        <span class="stat-title">Game</span>
        <span class="stat-value">{timeSinceGame}</span>
      </div>
      <div class="stat place-items-center">
        <span class="stat-title">Round</span>
        <span class="stat-value">{timeSinceGame}</span>
      </div>
      <div class="stat place-items-center">
        <span class="stat-title">Players</span>
        <span class="stat-value">{state.players.length}</span>
      </div>
      <div class="stat place-items-center">
        <span class="stat-title">Total requests</span>
        <span class="stat-value">{totalRequests}</span>
      </div>
    </div>
  );
};

const PlayOrStop = ({ state }: RoundProps) => {
  const { status } = state;

  return (
    <form class="flex flex-row gap-2" method="POST" action="">
      {status === "stopped" ? (
        <>
          <button
            type="submit"
            formaction="/admin/start-demo"
            class="btn btn-outline btn-warning"
          >
            Start Demo
          </button>
          <button
            type="submit"
            formaction="/admin/start-game"
            class="btn btn-outline btn-success"
          >
            Start Game
          </button>
          <button
            type="submit"
            formaction="/admin/reset-game"
            class="btn btn-outline btn-error"
          >
            Reset Game
          </button>
        </>
      ) : (
        <>
          <button
            type="submit"
            formaction="/admin/pause-game"
            class="btn btn-outline btn-warning"
          >
            Pause Game
          </button>
          <button
            type="submit"
            formaction="/admin/stop-game"
            class="btn btn-outline btn-error"
          >
            Stop Game
          </button>
        </>
      )}
    </form>
  );
};

const Round = ({ state }: RoundProps) => {
  const { round, status, mode, players } = state;
  const total = mode === "demo" ? 1 : gameQuestions.length / 2;
  return (
    <div class="flex flex-col gap-4 justify-items-center">
      <div class="flex flex-row justify-between items-center">
        <div class="flex flex-row">
          <PlayOrStop state={state} />
        </div>
        <p class="text-center text-2xl">
          Round {round}
          &nbsp;of&nbsp;
          {total}
        </p>
        <form class="" hx-trigger="click">
          <div class="flex flex-row join gap-[1px]">
            <button
              class="join-item btn btn-outline btn-error"
              type="submit"
              action="/admin/previous-round"
              disabled={status === "stopped"}
              hx-post="/admin/previous-round"
            >
              Previous Round
            </button>

            <button
              class="join-item btn btn-outline btn-success"
              type="submit"
              action="/admin/next-round"
              disabled={status === "stopped"}
              hx-post="/admin/next-round"
            >
              Next Round
            </button>
          </div>
        </form>
      </div>
      <progress
        class="progress max-w-full progress-primary"
        value={status === "stopped" ? 0 : round}
        max={state.mode === "demo" ? 1 : total}
      />
    </div>
  );
};

const Player = (player: State["players"][number]) => {
  const rowId = `player-${player.uuid}`;
  return (
    <tr class="" id={rowId}>
      <td>
        <a
          class="link link-hover"
          href={`/players/${player.uuid}`}
          hx-boost="true"
          hx-target="#content"
        >
          {player.nick}
        </a>
      </td>
      <td>{player.url}</td>
      <td>{player.log?.[0]?.score ?? 0}</td>
      <td>
        {player.playing ? (
          <span class="text-success">Playing</span>
        ) : (
          <span class="text-error">Not playing</span>
        )}
      </td>
      <td>
        <form
          method="POST"
          action="/admin/remove"
          hx-post="/admin/remove"
          hx-target={`#${rowId}`} // Replace row with (empty) hx response to remove it
          hx-swap="outerHTML"
        >
          <input type="hidden" name="uuid" value={player.uuid} />
          <button type="submit" class="btn btn-sm btn-outline btn-error">
            Remove
          </button>
        </form>
      </td>
    </tr>
  );
};

interface AdminProps {
  state: State;
}

const Admin = ({ state }: AdminProps) => {
  return (
    <div id="content" class="flex flex-col min-w-full max-w-full gap-16">
      {/* Display round */}
      <Round state={state} />
      <Stats state={state} />
      <h2 class="hidden">Players</h2>
      <div class="overflow-x-auto max-w-full h-full">
        <table class="table text-">
          <thead>
            <tr>
              <th>Nick</th>
              <th>URL</th>
              <th>Score</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {state.players
              .toSorted((a, b) => a.nick.localeCompare(b.nick))
              .map((player) => (
                <Player {...player} />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const plugin = new Elysia()
  .use(htmx())
  .use(cookie())
  .use(statePlugin)
  .get("/admin", ({ hx, cookie, store: { state } }) => {
    const header = (
      <div class="">
        <a href="/admin/logout" class="btn btn-ghost">
          Logout
        </a>
      </div>
    );

    if (cookie.user === "admin") {
      const Layout = hx.isHTMX ? HXLayout : FullScreenLayout;
      return (
        <Layout page="Admin" header={header}>
          <Admin state={state} />
        </Layout>
      );
    }
    const Layout = hx.isHTMX ? HXLayout : HeroLayout;
    return (
      <Layout page="Sign Up" header={header}>
        <AdminLoginForm fieldErrors={{}} />
      </Layout>
    );
  })
  .get("/admin/time", ({ hx, store: { state } }) => {
    return <Stats state={state} />;
  })
  .post(
    "/admin/login",
    ({ body: { secret }, hx, set, setCookie }) => {
      const fieldErrors: Record<string, string> = {};

      if (secret !== Bun.env.CMC_SECRET) {
        fieldErrors["/secret"] = "Invalid secret";
      } else {
        setCookie("user", "admin");
      }

      if (Object.keys(fieldErrors).length) {
        set.status = 400;
        const Layout = hx.isHTMX ? HXLayout : HTMLLayout;
        return (
          <Layout page="Admin">
            <AdminLoginForm fieldErrors={fieldErrors} secret={""} />
          </Layout>
        );
      }

      if (hx.isHTMX) {
        hx.redirect("/admin");
      } else {
        set.redirect = "/admin";
      }
    },
    {
      body: t.Object({
        secret: t.String({}),
      }),
      error: ({ code, error, hx, set }) => {
        const Layout = hx.isHTMX ? HXLayout : HTMLLayout;
        if (code === "VALIDATION") {
          set.status = 200;
          const errors = mapValidationError(error as ValidationError);
          return (
            <Layout page="Admin">
              <AdminLoginForm fieldErrors={errors} />
            </Layout>
          );
        }
        return (
          <Layout page="Admin">
            <AdminLoginForm fieldErrors={{}} />
          </Layout>
        );
      },
    }
  )
  .post(
    "/admin/remove",
    ({ body: { uuid }, hx, set, store: { state } }) => {
      removePlayer(state, uuid);
      if (!hx.isHTMX) {
        set.redirect = "/admin";
        hx.redirect("/admin");
      } else {
        return <></>;
      }
    },
    {
      body: t.Object({
        uuid: t.String(),
      }),
    }
  )
  .post("/admin/start-demo", ({ hx, set, store: { state } }) => {
    startGame(state, "demo");
    for (const player of state.players) {
      console.log("Start demo for player", player);
      askPlayerQuestion(state, player);
    }

    set.redirect = "/admin";
  })
  .post("/admin/stop-game", ({ hx, set, store: { state } }) => {
    const Layout = hx.isHTMX ? HXLayout : HTMLLayout;
    state.status = "stopped";

    if (hx.isHTMX) {
      return (
        <Layout page="Admin">
          <PlayOrStop state={state} />
        </Layout>
      );
    }

    set.redirect = "/admin";
  });
