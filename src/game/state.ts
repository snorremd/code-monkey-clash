import { Elysia } from "elysia";
import type { GameEvent, PlayerWorkerEvent, SaveStateEvent } from "./events";
import { playerColor } from "../helpers/helpers";
import { gameQuestions } from "./questions";

// biome-ignore lint/complexity/useLiteralKeys: <explanation>
const stateLocation = Bun.env["CMC_STATE_FILE"] ?? "./state.json";

// Max possible rounds given number of questions
const maxRounds = Math.floor(gameQuestions.length / 2);

// Setup types for the game state including player logs, workers, etc
export type GameStatus = "playing" | "paused" | "stopped";
export type GameMode = "demo" | "game";

export interface PlayerLog {
  id: number;
  /** Date time as millisecs since epoch */
  date: number;
  score: number;
  points: number;
  question: string;
  answer?: string;
  statusCode?: number;
  error?: string;
  questionInterval?: number;
  answerRatio: number;
}

export interface Player {
  /** A Bun worker running player-worker.ts script */
  worker?: PlayerWorker;
  uuid: string;
  nick: string;
  color: { class: string; hex: string };
  url: string;
  playing: boolean;
  score: number;
  question_interval: number;
  log: PlayerLog[];
}

export type SerializablePlayer = Omit<Player, "worker">;

export interface State {
  mode?: GameMode;
  status: GameStatus;
  gameStartedAt?: string; // ISO date time
  roundStartedAt?: string; // ISO date time
  round: number;
  players: Player[];
  /**
   * A record of listening callback functions to call for each new game event.
   * Allows UI-related logic to listen for new game events and update the UI via SSE.
   * The key is a nanoid that identifies the listener and the value is the callback function.
   * UI listeners can be added and removed dynamically as clients connect and disconnect.
   */
  uiListeners: Record<string, (e: GameEvent) => void>;
}

export interface StateWorker extends Worker {
  postMessage: (event: SaveStateEvent) => void;
}

/**
 * State worker to handle state persistence in a blocking manner.
 * This worker listens for new state updates from the main thread and then
 * writes the state to the file system in a blocking manner.
 */
const stateWorker = new Worker(
  new URL("./workers/state-worker.ts", import.meta.url)
) as StateWorker;

async function loadState() {
  return (await Bun.file(stateLocation).exists())
    ? await Bun.file(stateLocation).json()
    : ({
        round: 0,
        players: [],
        status: "stopped",
        uiListeners: {},
      } satisfies State);
}

async function saveState(state: State) {
  const serializable: SaveStateEvent = {
    type: "save-state",
    path: stateLocation,
    state: {
      ...state,
      players: state.players.map((p) => ({
        ...p,
        worker: undefined,
      })),
      uiListeners: {},
    },
  };
  stateWorker.postMessage(serializable);
}

// Immediately load state from file system
export const state = (await loadState()) as State;

if (state.status === "playing") {
  state.status = "paused";
  saveState(state);
}

type CreatePlayer = Pick<Player, "nick" | "url">;

/**
 * From the perspective of the main thread, a player worker is a worker
 * that you can post game events to and listen for player events from.
 */
interface PlayerWorker extends Worker {
  postMessage: (event: GameEvent) => void;
  onmessage: (event: MessageEvent<PlayerWorkerEvent>) => void;
}

const newWorker = (player: Player) => {
  player.worker = undefined;
  const worker = new Worker(
    new URL("./workers/player-worker.ts", import.meta.url)
  ) as PlayerWorker;

  worker.postMessage({
    type: "player-joined",
    ...player,
  });

  worker.onmessage = (event) => {
    const { type } = event.data;
    switch (type) {
      case "player-answer":
      case "player-question":
        {
          const { uuid, log } = event.data;
          const player = state.players.find((p) => p.uuid === uuid);
          if (player) {
            player.log.unshift(log);
          }
          // We need to notify all relevant listeners about the new log
          // Multiple listeners can be listening for the same player
          for (const listener of Object.values(state.uiListeners)) {
            listener(event.data);
          }

          saveState(state);
        }
        break;
    }
  };

  return worker;
};

/**
 * Create a new player and add it to the state.
 * Accepts the state of the player to be
 * @param state The current game state
 * @param playerPayload The player details needed to create a new player
 * @returns the UUID of the new player
 */
export const addPlayer = (state: State, playerPayload: CreatePlayer) => {
  const newPlayer: Player = {
    ...playerPayload,
    uuid: crypto.randomUUID(),
    color: playerColor(state.players.length),
    log: [],
    question_interval: 10,
    score: 0,
    playing: true,
  };

  state.players.push(newPlayer);
  saveState(state);

  for (const listener of Object.values(state.uiListeners)) {
    listener({
      type: "player-joined",
      ...newPlayer,
    });
  }

  return newPlayer.uuid;
};

export function playerSurrender(state: State, uuid: string) {
  const player = state.players.find((p) => p.uuid === uuid);
  if (player) {
    player.playing = false;
    player.worker?.postMessage({ type: "player-left", uuid });
    player.worker = undefined;
    saveState(state);
  }
}

export const removePlayer = (state: State, uuid: string) => {
  const player = state.players.find((p) => p.uuid === uuid);
  player?.worker?.postMessage({ type: "player-left", uuid });
  state.players = state.players.filter((p) => p.uuid !== uuid);

  saveState(state);
};

export const startGame = (state: State, mode: State["mode"]) => {
  state.status = "playing";
  state.mode = mode;
  state.round = 1;
  state.gameStartedAt = new Date().toISOString();
  state.roundStartedAt = new Date().toISOString();

  // Notify all player workers that the game has started
  for (const player of state.players) {
    player.worker = newWorker(player);
    player.worker?.postMessage({
      type: "game-started",
      mode: mode ?? "demo",
      round: state.round,
    });
  }
  saveState(state);
};

export const stopGame = (state: State) => {
  state.status = "stopped";
  state.round = 0;
  state.gameStartedAt = undefined;
  state.roundStartedAt = undefined;
  for (const player of state.players) {
    player.worker?.postMessage({ type: "game-stopped" });
  }

  saveState(state);
};

export const pauseGame = (state: State) => {
  state.status = "paused";
  for (const player of state.players) {
    player.worker?.postMessage({ type: "game-paused" });
  }

  saveState(state);
};

export const resetGame = (state: State) => {
  state.status = "stopped";
  state.round = 1;
  state.players = state.players.map((p) => ({
    ...p,
    playing: true,
    score: 0,
    log: [],
  }));

  saveState(state);
};

export const continueGame = (state: State) => {
  state.status = "playing";
  for (const player of state.players) {
    // If we've just restarted the server and resumed from a serialized state
    // we need to create a new worker for the player
    if (!player.worker) {
      player.worker = newWorker(player);
      const { worker, ...withoutWorker } = player;
      player.worker.postMessage({
        type: "player-joined",
        ...withoutWorker,
      });
    }
    player.worker.postMessage({ type: "game-continued" });
  }

  saveState(state);
};

export const nextRound = (state: State) => {
  if (state.round < maxRounds) {
    state.round += 1;
    state.roundStartedAt = new Date().toISOString();
    for (const player of state.players) {
      player.worker?.postMessage({ type: "change-round", round: state.round });
    }

    saveState(state);
  }
};

export const previousRound = (state: State) => {
  if (state.round > 1) {
    state.round -= 1;
    state.roundStartedAt = new Date().toISOString();
    for (const player of state.players) {
      player.worker?.postMessage({ type: "change-round", round: state.round });
    }

    saveState(state);
  }
};

export const plugin = new Elysia().state("state", state as State);
