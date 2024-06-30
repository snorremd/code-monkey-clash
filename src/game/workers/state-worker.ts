/**
 * state-worker.ts implements a blocking state persistence worker
 * that listens for new state updates from the main thread and then
 * writes the state to the file system in a blocking manner.
 * This way we ensure that a whole state is written before another
 * write operation is started, thus avoiding broken JSON.
 */
import { writeFileSync } from "node:fs";
import type { SaveStateEvent } from "../events";

// biome-ignore lint/style/noVar: Necessary for Web Workers
declare var self: Worker;

/**
 * Handler for state updates from the main thread.
 * Receives one type of event, the state update.
 * @param event The game state
 */
self.onmessage = (event: MessageEvent<SaveStateEvent>) => {
  const state = event.data.state;
  const path = event.data.path;
  const content = JSON.stringify(state, null, 2);
  writeFileSync(path, content); // Blergh, but it works
};
