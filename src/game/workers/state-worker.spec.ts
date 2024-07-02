import {
	type PartialDeepObject,
	fromPartial,
} from "@total-typescript/shoehorn";
import { expect, describe, it } from "bun:test";
import { nanoid } from "nanoid";
import type { State, StateWorker } from "../state";
import type { SaveStateEvent } from "../events";

describe("state-worker", () => {
	it("should write state to file system", () => {
		const statePath = `/tmp/state-${nanoid}.json`;
		const stateEvent: PartialDeepObject<SaveStateEvent> = {
			path: statePath,
			state: {
				mode: "game",
				status: "playing",
				players: [
					{
						uuid: "123",
						nick: "test",
						url: "http://example.com",
					},
				],
			},
		};

		const worker = new Worker(
			new URL("./state-worker.ts", import.meta.url),
		) as StateWorker;
		worker.postMessage(fromPartial(stateEvent));

		// Wait for the worker to finish
		setTimeout(async () => {
			const content = (await Bun.file(
				statePath,
			).json()) as unknown as PartialDeepObject<State>;

			expect(content).toEqual({
				mode: "game",
				status: "playing",
				players: [
					{
						uuid: "123",
						nick: "test",
						url: "http://example.com",
					},
				],
			});
		}, 100);
	});
});
