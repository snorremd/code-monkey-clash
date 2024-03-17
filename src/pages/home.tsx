import { Elysia } from "elysia";
import { htmx } from "elysia-htmx";
import { HeroLayout } from "../layouts/main";

export const plugin = new Elysia().use(htmx()).get("/", ({ hx }) => {
	return (
		<HeroLayout page="Home">
			<div class="max-w-md">
				<h1 class="mb-5 text-5xl font-bold">Code Monkey Clash</h1>
				<p class="mb-5 text-xl">
					Welcome to Code Monkey Clash, a game inspired by Extreme Startup
					hackathon. Compete against other players to see who can solve code
					puzzles the fastest.
				</p>
				<a
					class="btn btn-primary"
					href="/signup"
					hx-get="/signup"
					hx-trigger="click"
					hx-target="#content"
					hx-replace-url="true"
				>
					Get Started
				</a>
			</div>
		</HeroLayout>
	);
});
