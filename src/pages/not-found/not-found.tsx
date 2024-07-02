import { HTMLLayout } from "../../layouts/main";
import { basePluginSetup } from "../../plugins";

export const notFoundPlugin = basePluginSetup().all("*", () => {
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
				hx-target="#main"
			>
				<div class="z-10 flex flex-col gap-5 prose items-center text-center justify-center">
					<div class="rounded-2xl z-10 bg-base-100 p-8 bg-opacity-80 backdrop-blur-sm w-full">
						<h1 class="mb-5 text-5xl font-bold">404 - Not Found</h1>
						<a class="btn btn-primary" href="/signup" hx-push-url="true">
							Get Started
						</a>
					</div>
					<img
						class="rounded-2xl shadow-xl m-0"
						src="/public/code-monkey-clash-landing-image.webp"
						alt="Code Monkey Clash"
					/>
				</div>
			</div>
		</HTMLLayout>
	);
});
