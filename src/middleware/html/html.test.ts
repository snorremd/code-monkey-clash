import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { htmlPlugin, isHTML } from "./html";

describe("html", () => {
	describe("isHTML", () => {
		it("should return true for valid HTML", () => {
			expect(isHTML("<html></html>")).toBe(true);
		});

		it("should return false for invalid HTML", () => {
			expect(isHTML("html")).toBe(false);
		});
	});

	describe("html", () => {
		it("should set the Content-Type header to text/html; charset=utf-8", async () => {
			const app = new Elysia()
				.use(htmlPlugin())
				.all("*", () => "<html></html>");
			const response = await app.handle(new Request("http://localhost/"));
			console.log("What on earth", response.headers);
			expect(response.headers.get("content-type")).toBe(
				"text/html; charset=utf-8",
			);
		});

		it("should add a doctype to the response", async () => {
			const app = new Elysia({ name: "html" })
				.use(htmlPlugin())
				.get("*", () => "<html></html>");
			const response = await app.handle(new Request("http://localhost/"));
			const text = await response.text();
			expect(text).toBe("<!doctype html><html></html>");
		});
	});
});
