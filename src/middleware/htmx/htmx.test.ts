import { describe, expect, it } from "bun:test";
import { htmx, type Htmx } from "./htmx";
import Elysia from "elysia";

const app = new Elysia()
  .use(htmx())
  .get("/", ({ htmx, headers }) => {
    return {
      htmx,
      requestHeaders: headers,
    };
  })
  .get("/location", ({ htmx }) => {
    htmx.location("/new-location");

    return {
      htmx,
    };
  });

const request = async (path: string, requestInit?: RequestInit) => {
  const response = await app.handle(
    new Request(`http://localhost${path}`, requestInit)
  );

  return {
    status: response.status,
    headers: response.headers,
    body: (await response.json()) as {
      htmx: Htmx;
      requestHeaders: {
        [key: string]: string;
      };
    },
  };
};

describe("htmx", () => {
  it("should set isHtmx to false hwne not passing HX-Request header", async () => {
    const {
      body: { htmx, requestHeaders },
    } = await request("/", {});

    expect(requestHeaders["hx-request"]).toBeUndefined();
    expect(htmx.is).toBe(false);
  });

  it("should set isHtmx to true when passing HX-Request header", async () => {
    const {
      body: { htmx, requestHeaders },
    } = await request("/", {
      headers: {
        "HX-Request": "true",
      },
    });

    expect(requestHeaders["hx-request"]).toBe("true");
    expect(htmx.is).toBe(true);
  });

  it("should set boosted to true when passing HX-Boosted header", async () => {
    const {
      body: { htmx, requestHeaders },
    } = await request("/", {
      headers: {
        "HX-Boosted": "true",
      },
    });

    expect(requestHeaders["hx-boosted"]).toBe("true");
    expect(htmx.boosted).toBe(true);
  });

  it("should allow setting HX-Location header", async () => {
    const {
      body: { htmx, requestHeaders },
      headers,
    } = await request("/location", {
      headers: {
        "HX-Request": "true",
      },
    });

    expect(headers.get("HX-Location")).toBe("/new-location");
  });
});
