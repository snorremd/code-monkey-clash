interface LayoutProps {
  page: string;
  header?: JSX.Element | JSX.Element[];
  children: JSX.Element | JSX.Element[];
}

export const HTMLLayout = ({ page, header, children }: LayoutProps) => {
  return (
    <html lang="en" class="h-full">
      <head>
        <title safe>{page} - Extreme Startup</title>
        <link rel="stylesheet" href="/public/tailwind.css" />
        <script src="/public/htmx.min.js" />
        <script src="/public/response-targets.js" />
      </head>
      <body class="bg-base-100">
        <header class="navbar absolute inset-x-0 top-0 z-50 bg-base-300">
          <div class="flex-1">
            <a class="btn btn-ghost text-xl text-primary" href="/">
              Code Monkey Clash
            </a>
          </div>
          {header as "safe"}
        </header>
        <main
          id="main"
          class="z-100 min-w-full min-h-screen flex flex-col grow py-16 px-8"
        >
          {children as "safe"}
        </main>
        <footer class="fixed bg-base-100 bg-opacity-20 inset-x-0 bottom-0 z-50 text-neutral-content text-end p-4">
          A game by{" "}
          <a class="link" href="https://snorre.io">
            Snorre Magnus Davøen
          </a>
        </footer>
      </body>
    </html>
  );
};

export const HeroLayout = ({ page, children }: LayoutProps) => {
  return (
    <HTMLLayout page={page}>
      <div class="hero-content text-center text-neutral-content">
        {children as "safe"}
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
      <title safe>{page} - Extreme Startup</title>
      {children as "safe"}
    </>
  );
};
