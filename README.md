# Code Monkey Clash

## Running server

You can run from source with [bun](https://bun.sh):

```sh
git clone git@github.com:snorremd/code-monkey-clash.git
bun install
bun run dev
```

TODO: Support docker

## Development

```sh
bun install
bun run dev
```

## Technical Decisions

This project is mostly done for fun and to learn new things, so I've decided to use a few technologies that I'm not very familiar with.
Bun, ElysiaJS, htmx and DaisyUI are all new to me, so I'm excited to see how they work in practice.

For this project I wanted to keep things a bit old-school and use a web oriented, server-side rendered approach.
So instead of doing a SPA with a REST API I opted to implement a traditional web server with endpoints returning HTML.
To give the UI some interactivity I've added [htmx](https://htmx.org/) to the mix.
It is a lightweight library that allows you to add AJAX functionality to your web pages without having to write JavaScript.
This way I can keep the server-side rendering and still have some interactivity in the UI where needed.
Most of the UI should work without JavaScript, but for live log and graph updates users will have to enable JavaScript for htmx to work.

I love TypeScript so for the server I've settled on using [ElysiaJS](https://elysiajs.com/), a fast web framework that runs on [Bun](https://bun.sh).
Bun gives me a performant JavaScript runtime and the ability to use TypeScript without any additional build tools.
ElysiaJS is inspired by frameworks like Express, but has superb TypeScript support and a focus on performance.
The game server will be implemented as a simple ElysiaJS server where state is managed in-memory for simplicity.
To make things more robust, serialization and deserialization of state will be implemented so that the server can be restarted without losing state.

For styling I'm going for familiar technology, namely [Tailwind CSS](https://tailwindcss.com/).
This time however I'm opting to use a CSS component library on top called [DaisyUI](https://daisyui.com/).
DaisyUI provides pre-defined components like buttons, inputs, etc that use the Tailwind CSS utility classes under the hood.
This way I get components with consistent look and feel while still having the flexibility of Tailwind CSS with a consistent look and feel.
The style I'm aiming for is a neon-futuristic look with dark background and bright neon colors.

For events and real-time communication server-sent events will be used.
This is a simple and efficient way to push events from the server to the client without having to deal with WebSockets.
Using HTMX extensions for SSE the client can listen for events and update the UI accordingly.

### Some caveats

If two async functions that modify different parts of the state runs concurrently, writes might not catch all the state.
E.g. if function a modifies player a, and function b modifies player b, and they run concurrently, the state file might end up in a state where player b is updated but player a is not.
This can happen because the state modification, serialization, and file write is not an atomic operation.
In practice this should not be too much of a problem as there should be limited writes to the state file, and the state file is only used for persistence and not for real-time state updates.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.