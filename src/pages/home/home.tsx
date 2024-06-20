import { HTMLLayout } from "../../layouts/main";
import { basePluginSetup } from "../../plugins";

export const plugin = basePluginSetup().get("/", ({ set }) => {
	const header = (
		<nav hx-boost="true" hx-target="#main">
			<a href="/admin" class="btn">
				Admin
			</a>
		</nav>
	);
	return (
		<HTMLLayout page="Home" header={header}>
			<div
				class="epic min-w-full max-h-full flex flex-col grow items-center justify-center prose"
				hx-boost="true"
				hx-target="#main"
			>
				<div class="z-10 flex flex-col prose items-center text-center justify-center">
					<h1 class="mb-5 text-5xl font-bold">
						<img
							class="rounded-2xl shadow-xl m-0"
							src="/public/code-monkey-clash-landing-image.webp"
							alt="Code Monkey Clash"
						/>
					</h1>
					<div class="rounded-2xl z-10 bg-base-100 p-8 bg-opacity-80 backdrop-blur-sm">
						<p class="mb-5 text-xl">
							Welcome to Code Monkey Clash, a game inspired by Extreme Startup
							hackathon. Compete against other players to see who can solve code
							puzzles the fastest.
						</p>
						<a class="btn btn-primary" href="/signup">
							Get Started
						</a>
					</div>
				</div>
			</div>
		</HTMLLayout>
	);
});
