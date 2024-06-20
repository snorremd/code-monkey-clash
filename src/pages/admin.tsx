import { Elysia, type ValidationError, t } from "elysia";
import { askPlayerQuestion } from "../game/game";
import { gameQuestions } from "../game/questions";
import { diffNow, formatDuration, mapValidationError } from "../helpers";
import { HTMLLayout, HXLayout } from "../layouts/main";
import { basePluginSetup } from "../plugins";
import {
	type State,
	removePlayer,
	startGame,
	plugin as statePlugin,
} from "../state";

interface FormProps {
	secret?: string;
	fieldErrors: Record<string, string>;
}

const AdminLoginForm = ({ fieldErrors, secret }: FormProps) => {
	return (
		<div class="epic flex flex-col justify-center grow items-center">
			<form
				class="rounded-2xl z-10 bg-base-100 p-8 bg-opacity-80 backdrop-blur-sm w-full max-w-md flex flex-col items-stretch gap-4"
				hx-post="/admin/login"
				hx-target="this"
				hx-swap="outerHTML"
				hx-boost
			>
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">What is the admin secret?</span>
					</div>
					<input
						type="password"
						name="secret"
						class="input input-bordered w-full"
						value={secret}
					/>
					{fieldErrors["/secret"] ? (
						<div class="label-text-alt mt-2 text-error" safe>
							{fieldErrors["/secret"]}
						</div>
					) : null}
				</label>
				<button type="submit" class="btn btn-primary">
					Login
				</button>
			</form>
		</div>
	);
};

interface RoundProps {
	state: State;
}

const Stats = ({ state }: RoundProps) => {
	const { mode } = state;

	const totalRequests = state.players.reduce(
		(acc, player) => acc + player.log.length,
		0,
	);

	return (
		<div
			id="counter"
			class="stats stats-horizontal text-2xl max-w-full"
			hx-get="/admin/time"
			hx-swap="outerHTML"
			hx-target="this"
		>
			<div class="stat place-items-center">
				<span class="stat-title">Game</span>
				<span class="stat-value font-mono">
					<cmc-counter
						count={state.status === "playing"}
						dateTime={state.gameStartedAt}
					/>
				</span>
			</div>
			<div class="stat place-items-center">
				<span class="stat-title">Round</span>
				<span class="stat-value font-mono">
					<cmc-counter
						count={state.status === "playing"}
						dateTime={state.roundStartedAt}
					/>
				</span>
			</div>
			<div class="stat place-items-center">
				<span class="stat-title">Players</span>
				<span class="stat-value font-mono">{state.players.length}</span>
			</div>
			<div class="stat place-items-center">
				<span class="stat-title">Total requests</span>
				<span class="stat-value font-mono">{totalRequests}</span>
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
					<button
						type="submit"
						formaction="/admin/reset-state"
						class="btn btn-outline btn-error"
					>
						Reset Server
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
		<div class="rounded-lg flex flex-col gap-4 justify-items-center">
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
		<tr class="odd:bg-base-300" id={rowId}>
			<td>
				<a
					class="link link-hover"
					href={`/players/${player.uuid}`}
					hx-boost="true"
					hx-target="#content"
					hx-swap="outerHTML"
					safe
				>
					{player.nick}
				</a>
			</td>
			<td safe>{player.url}</td>
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
		<div
			id="content"
			class="epic pt-8 flex flex-col min-w-full max-w-full gap-8"
		>
			{/* Display round */}
			<div class="flex flex-col gap-8 z-10 bg-base-100 bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl">
				<Round state={state} />
				<Stats state={state} />
			</div>
			<div class="z-10 bg-base-100 bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl">
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
									// biome-ignore lint/correctness/useJsxKeyInIterable: Don't need it here
									<Player {...player} />
								))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export const plugin = basePluginSetup()
	.get("/admin", ({ htmx, cookie: { user }, store: { state } }) => {
		const header = (
			<div class="">
				<a href="/admin/logout" class="btn btn-ghost">
					Logout
				</a>
			</div>
		);

		if (user.value === "admin") {
			const Layout = htmx.is ? HXLayout : HTMLLayout;
			return (
				<Layout page="Admin" header={header}>
					<Admin state={state} />
				</Layout>
			);
		}
		const Layout = htmx.is ? HXLayout : HTMLLayout;
		return (
			<Layout page="Sign Up" header={header}>
				<AdminLoginForm fieldErrors={{}} />
			</Layout>
		);
	})
	.get("/admin/time", ({ store: { state } }) => {
		return <Stats state={state} />;
	})
	.post(
		"/admin/login",
		({ body: { secret }, htmx, set, cookie: { user } }) => {
			const fieldErrors: Record<string, string> = {};

			if (secret !== Bun.env.CMC_SECRET) {
				fieldErrors["/secret"] = "Invalid secret";
			} else {
				user.set({
					value: "admin",
					expires: new Date(Date.now() + 1000 * 60 * 60),
					httpOnly: true,
				});
			}

			if (Object.keys(fieldErrors).length) {
				set.status = 400;
				const Layout = htmx.is ? HXLayout : HTMLLayout;
				return (
					<Layout page="Admin">
						<AdminLoginForm fieldErrors={fieldErrors} secret={""} />
					</Layout>
				);
			}

			if (htmx.is) {
				htmx.redirect("/admin");
			} else {
				set.redirect = "/admin";
			}
		},
		{
			body: t.Object({
				secret: t.String({}),
			}),
			error: ({ code, error, htmx, set }) => {
				const Layout = htmx.is ? HXLayout : HTMLLayout;
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
		},
	)
	.post(
		"/admin/remove",
		({ body: { uuid }, htmx, set, store: { state } }) => {
			removePlayer(state, uuid);
			if (!htmx.is) {
				set.redirect = "/admin";
				htmx.redirect("/admin");
			} else {
				return <></>;
			}
		},
		{
			body: t.Object({
				uuid: t.String(),
			}),
		},
	)
	.post("/admin/start-demo", ({ set, store: { state } }) => {
		startGame(state, "demo");
		for (const player of state.players) {
			askPlayerQuestion(state, player);
		}

		set.redirect = "/admin";
	})
	.post("/admin/stop-game", ({ htmx, set, store: { state } }) => {
		const Layout = htmx.is ? HXLayout : HTMLLayout;
		state.status = "stopped";

		if (htmx.is) {
			return (
				<Layout page="Admin">
					<PlayOrStop state={state} />
				</Layout>
			);
		}

		set.redirect = "/admin";
	});
