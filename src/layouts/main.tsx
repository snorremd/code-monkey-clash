interface LayoutProps {
  page: string;
  header?: JSX.Element | JSX.Element[];
  children: JSX.Element | JSX.Element[];
}

export const HTMLLayout = ({ page, header, children }: LayoutProps) => {
  return (
    <html lang="en" class="h-full bg-stone-900">
      <head>
        <title>{page} - Extreme Startup</title>
        <link rel="stylesheet" href="/public/tailwind.css" />
        <script src="/public/htmx.min.js" />
        <script src="/public/response-targets.js" />
      </head>
      <body
        class="prose max-w-none bg-slate-800 relative hero min-h-full min-w-screen"
        style="background-image: url(/public/background.jpg);"
      >
        <div class="hero-overlay bg-opacity-[98%]" />
        <header class="navbar absolute inset-x-0 top-0 z-50 bg-base-100">
          <div class="flex-1">
            <a class="btn btn-ghost text-xl text-primary" href="/">
              Code Monkey Clash
            </a>
          </div>
          {header}
        </header>
        {children}
      </body>
    </html>
  );
};

export const FullScreenLayout = ({ page, header, children }: LayoutProps) => {
  return (
    <HTMLLayout page={page} header={header}>
      <div class="w-full h-full px-8 pt-16">{children}</div>
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
      <div class="hero-content text-center text-neutral-content">
        {children}
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
