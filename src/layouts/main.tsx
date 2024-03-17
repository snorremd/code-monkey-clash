interface LayoutProps {
	page: string;
	children: JSX.Element | JSX.Element[];
}

export const HTMLLayout = ({ page, children }: LayoutProps) => {
	return (
		<html lang="en" class="h-full bg-stone-900">
			<head>
				<title>{page} - Extreme Startup</title>
				<link rel="stylesheet" href="/public/tailwind.css" />
				<script src="/public/htmx.min.js" />
				<script src="/public/response-targets.js" />
			</head>
			<body class="prose max-w-none min-w-full min-h-full bg-slate-800">
				{children}
			</body>
		</html>
	);
};

export const FullScreenLayout = ({ page, children }: LayoutProps) => {
	return (
		<HTMLLayout page={page}>
			<div
				class="hero min-h-screen"
				style="background-image: url(/public/background.jpg);"
			>
				<div class="hero-overlay bg-opacity-95" />
				<div class="flex flex-col min-h-full min-w-full px-16 py-16">
					{children}
				</div>
			</div>
			{/* Display credit in the bottom right corner */}
			<div class="absolute bottom-0 right-0 p-4 text-xs text-neutral-content">
				<p>
					Photo by{" "}
					<a href="https://unsplash.com/@alesnesetril" class="underline">
						Ales Nesetril
					</a>{" "}
					on{" "}
					<a
						href="https://unsplash.com/photos/gray-and-black-laptop-computer-on-surface-Im7lZjxeLhg"
						class="underline"
					>
						Unsplash
					</a>
				</p>
			</div>
		</HTMLLayout>
	);
};

export const HeroLayout = ({ page, children }: LayoutProps) => {
	return (
		<HTMLLayout page={page}>
			<div
				class="hero min-h-screen"
				style="background-image: url(/public/background.jpg);"
			>
				<div class="hero-overlay bg-opacity-90" />
				<div id="content" class="hero-content text-center text-neutral-content">
					{children}
				</div>
			</div>
			{/* Display credit in the bottom right corner */}
			<div class="absolute bottom-0 right-0 p-4 text-xs text-neutral-content">
				<p>
					Photo by{" "}
					<a href="https://unsplash.com/@alesnesetril" class="underline">
						Ales Nesetril
					</a>{" "}
					on{" "}
					<a
						href="https://unsplash.com/photos/gray-and-black-laptop-computer-on-surface-Im7lZjxeLhg"
						class="underline"
					>
						Unsplash
					</a>
				</p>
			</div>
		</HTMLLayout>
	);
};

export const HXLayout = ({ page, children }: LayoutProps) => {
	return (
		<>
			<title>{page} - Extreme Startup</title>
			{children}
		</>
	);
};
