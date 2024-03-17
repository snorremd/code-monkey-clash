import { cookie } from "@elysiajs/cookie";
import { Elysia, type ValidationError, t } from "elysia";
import { htmx } from "elysia-htmx";
import { mapValidationError } from "../helpers";
import { FullScreenLayout, HTMLLayout, HXLayout } from "../layouts/main";
import {
	type State,
	addPlayer,
	removePlayer,
	plugin as statePlugin,
} from "../state";

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

const Player = (player: State["players"][number]) => {
	const rowId = `player-${player.uuid}`;
	return (
		<tr class="" id={rowId}>
			<th>
				<a
					class="link link-hover"
					href={`/players/${player.uuid}`}
					hx-boost="true"
					hx-target="#content"
				>
					{player.nick}
				</a>
			</th>
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
					<button type="submit" class="btn btn-sm btn-error">
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
	console.log("State", state);
	return (
		<div id="content" class="flex flex-col min-w-full gap-16">
			<div class="flex flex-row justify-between">
				<h1 class="text-4xl font-bold">Admin</h1>
				<a href="/admin/logout" class="btn btn-secondary">
					Logout
				</a>
			</div>

			<div class="flex flex-col min-w-full gap-8 items-center">
				{state.status === "test" ? (
					<h2 class="text-warning m-0">
						Test game started at {state.startedAt}
					</h2>
				) : null}
				{state.status === "game" ? (
					<h2 class="text-success m-0">Game started at {state.startedAt}</h2>
				) : null}
				{state.status === "stopped" ? (
					<h2 class="text-error m-0">Game stopped</h2>
				) : null}
				<div class="flex flex-row gap-4">
					{state.status === "stopped" ? (
						<>
							<form>
								<button
									type="submit"
									class="btn btn-warning"
									hx-post="/admin/start-demo"
									hx-trigger="click"
								>
									Start Demo
								</button>
							</form>
							<form>
								<button
									type="submit"
									class="btn btn-success"
									hx-post="/admin/start-game"
									hx-trigger="click"
								>
									Start Game
								</button>
							</form>
						</>
					) : null}
					{state.status !== "stopped" ? (
						<form>
							<button
								type="submit"
								class="btn btn-error"
								hx-get="/admin/stop"
								hx-trigger="click"
							>
								Stop
							</button>
						</form>
					) : null}
				</div>
			</div>
			<h2>Players</h2>
			<div class="overflow-x-auto w-full h-full">
				<table class="table">
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
		const Layout = hx.isHTMX ? HXLayout : FullScreenLayout;

		if (cookie.user === "admin") {
			return (
				<Layout page="Admin">
					<Admin state={state} />
				</Layout>
			);
		}
		return (
			<Layout page="Sign Up">
				<AdminLoginForm fieldErrors={{}} />
			</Layout>
		);
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
		},
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
		},
	);
