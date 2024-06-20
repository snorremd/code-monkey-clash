// Simplest bun server that answers the root route and reads the query string

const server = Bun.serve({
  port: 3001,
  fetch(request) {
    const q = new URL(request.url).searchParams.get("q") ?? "";

    let response = "";

    if (q?.startsWith("Capitalize the word:")) {
      const word = q.split(":")[1].trim();
      response = word.toUpperCase();
    }
    return new Response(response);
  },
});

console.log(`Listening on localhost:${server.port}`);
