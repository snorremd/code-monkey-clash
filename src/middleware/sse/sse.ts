/**
 * Ideally SSE setup would be implemented as a middleware in the server.
 * However I could not reliably make it work using an onAfterHandler in Elysia.
 * If I return a ReadableStream from a route handler Elysia will handle it natively as a response.
 * In effect exposing a helper to build the ReadableStream is about as convenient as a middleware.
 */

import { nanoid } from "nanoid";
import type { State } from "../../game/state";
import type { GameEvent } from "../../game/events";

/** Data to send to SSE clients (i.e. browsers) */
interface SSECallbackResponse {
	event: string;
	data: string;
}

/** Given state and event, return a HTML string or  */
type SSECallback = (state: State, event: GameEvent) => SSECallbackResponse[];

export class SSEResponse {
	public callbacks: SSECallback[];

	constructor(callbacks: SSECallback[]) {
		this.callbacks = callbacks;
	}
}

/**
 * Create a new SSE response stream for sending events to the client.
 * It accepts the game state, HTTP Request, and a list of callbacks to call
 * in order to generate the SSE data to send the client.
 *
 * The function sets up the stream so it handles disconnects and cleans up
 * the listener from the state.
 *
 * @param state a reference to the game state
 * @param request the HTTP request object
 * @param callbacks functions accepting state and game event, returning SSE data
 * @returns
 */
export function createSSEResponse(
	state: State,
	request: Request,
	callbacks: SSECallback[],
): ReadableStream {
	const id = nanoid();
	const stream = new ReadableStream({
		start(controller) {
			state.uiListeners[id] = (event) => {
				// If client disconnects, we need to clean up the listener
				if (request.signal.aborted) {
					controller.close();
				}
				for (const callback of callbacks) {
					// Go through each callback function
					const sseData = callback(state, event);
					for (const { event, data } of sseData) {
						// One callback can return multiple events
						controller.enqueue(`id: ${id}\nevent: ${event}\ndata: ${data}\n\n`);
					}
				}
			};
		},
		cancel() {
			console.log("Cancel called for ReadableStream");
			if (state.uiListeners[id]) {
				delete state.uiListeners[id];
			}
		},
	});

	// If the http client disconnects, we need to clean up the listener
	request.signal.onabort = () => {
		if (state.uiListeners[id]) {
			delete state.uiListeners[id];
		}
	};

	return stream;
}
