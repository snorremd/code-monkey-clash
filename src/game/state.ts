import { Elysia } from "elysia";
import type { PlayerWorker } from "./player-worker";
import type Stream from "@elysiajs/stream";

// Setup types for the game state including player logs, workers, etc
export type GameStatus = "playing" | "paused" | "stopped";
export type GameMode = "demo" | "game";

export interface PlayerLog {
  id: number;
  date: string;
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
  url: string;
  playing: boolean;
  score: number;
  question_interval: number;
  log: PlayerLog[];
}

interface LogListener {
  cb: (event: PlayerLog) => void;
  playerId: string;
}

export interface State {
  mode?: GameMode;
  status: GameStatus;
  gameStartedAt?: string; // ISO date time
  roundStartedAt?: string; // ISO date time
  round: number;
  players: Player[];
  /**
   * A record of listening callback functions to call for each new PlayerLog function
   * The string key is the listener ID so it can later remove itself if the SSE stream
   * is closed.
   */
  playerLogListeners: Record<string, LogListener>;
}

const stateLocation = "./state.json";

/**
 * State worker to handle state persistence in a blocking manner.
 * This worker listens for new state updates from the main thread and then
 * writes the state to the file system in a blocking manner.
 */
const stateWorker = new Worker(new URL("./state-worker.ts", import.meta.url));

async function loadState() {
  return (await Bun.file(stateLocation).exists())
    ? await Bun.file(stateLocation).json()
    : ({
        round: 0,
        players: [],
        status: "stopped",
        playerLogListeners: {},
      } satisfies State);
}

async function saveState(state: State) {
  const serializable = {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      worker: undefined,
    })),
    playerLogListeners: {},
  } satisfies State;
  stateWorker.postMessage(serializable);
}

// Immediately load state from file system
export const state = (await loadState()) as State;

if (state.status === "playing") {
  state.status = "paused";
  saveState(state);
}

type CreatePlayer = Pick<Player, "nick" | "url">;

const newWorker = (player: Pick<Player, "uuid" | "url">) => {
  const worker = new Worker(
    new URL("./player-worker.ts", import.meta.url)
  ) as PlayerWorker;

  worker.postMessage({
    type: "player-joined",
    uuid: player.uuid,
    url: player.url,
  });

  worker.onmessage = (event) => {
    const { type } = event.data;
    switch (type) {
      case "player-answer":
        {
          const { uuid, log } = event.data;
          const player = state.players.find((p) => p.uuid === uuid);
          if (player) {
            player.log.unshift(log);
          }
          // We need to notify all relevant listeners about the new log
          // Multiple listeners can be listening for the same player
          for (const listener of Object.values(state.playerLogListeners).filter(
            (l) => l.playerId === uuid
          )) {
            listener.cb(log);
          }
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
    log: [],
    question_interval: 10,
    score: 0,
    playing: true,
  };

  const worker = newWorker(newPlayer);
  newPlayer.worker = worker;
  state.players.push(newPlayer);

  console.log("Notify state worker about new state");
  saveState(state);

  console.log("Return new player UUID");
  return newPlayer.uuid;
};

export const removePlayer = (state: State, uuid: string) => {
  const player = state.players.find((p) => p.uuid === uuid);
  player?.worker?.postMessage({ type: "player-left", uuid });
  state.players = state.players.filter((p) => p.uuid !== uuid);

  saveState(state);
};

export const startGame = (state: State, mode: State["mode"]) => {
  state.status = "playing";
  state.mode = mode;
  state.gameStartedAt = new Date().toISOString();
  state.roundStartedAt = new Date().toISOString();

  // Notify all player workers that the game has started
  for (const player of state.players) {
    player.worker?.postMessage({
      type: "game-started",
      mode: mode ?? "demo",
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
    }
    player.worker.postMessage({ type: "game-continued" });
  }

  saveState(state);
};

interface ChangeScoreProps {
  state: State;
  player: Player;
  log: PlayerLog;
  points: number;
  statusCode?: number;
  error?: string;
  answer?: string;
}

export const changeScore = ({
  state,
  player,
  log,
  points,
  statusCode,
  error,
  answer,
}: ChangeScoreProps) => {
  player.score += points;
  log.score = player.score;
  log.points = points;
  log.statusCode = statusCode;
  log.error = error;
  log.answer = answer;
  saveState(state);
};

export const plugin = new Elysia().state("state", state as State);
