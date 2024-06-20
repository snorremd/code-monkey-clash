import { Elysia } from "elysia";
import type { PlayerWorker } from "./player-worker";

// Setup types for the game state including player logs, workers, etc
export type GameStatus = "playing" | "paused" | "stopped";
export type GameMode = "demo" | "game";

export interface PlayerLog {
  date: string;
  score: number;
  points: number;
  question: string;
  answer?: string;
  statusCode?: number;
  error?: string;
  questionInterval?: number;
}

export interface Player {
  /** A Bun worker running player-worker.ts script */
  worker: PlayerWorker;
  uuid: string;
  nick: string;
  url: string;
  playing: boolean;
  score: number;
  question_interval: number;
  log: PlayerLog[];
}

export interface State {
  mode?: GameMode;
  status: GameStatus;
  gameStartedAt?: string; // ISO date time
  roundStartedAt?: string; // ISO date time
  round: number;
  players: Player[];
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
      } satisfies State);
}

async function saveState(state: State) {
  const serializable = {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      worker: undefined,
    })),
  };
  stateWorker.postMessage(serializable);
}

// Immediately load state from file system
export const state = (await loadState()) as State;

type CreatePlayer = Pick<Player, "nick" | "url">;

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
    worker: new Worker(
      new URL("./player-worker.ts", import.meta.url)
    ) as PlayerWorker,
  };
  state.players.push(newPlayer);

  console.log("Notify player worker about player joined");
  // Pass initial player info to the player worker
  newPlayer.worker.postMessage({
    type: "player-joined",
    uuid: newPlayer.uuid,
    url: newPlayer.url,
  });

  console.log(
    "Register worker message handler to process worker messages on main thread"
  );
  newPlayer.worker.onmessage = (event) => {
    const { type } = event.data;
    switch (type) {
      case "player-answer":
        {
          const { uuid, log } = event.data;
          const player = state.players.find((p) => p.uuid === uuid);
          if (player) {
            newPlayer.log.unshift(log);
          }
        }
        break;
    }
  };

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
    player.worker.postMessage({ type: "game-stopped" });
  }

  saveState(state);
};

export const pauseGame = (state: State) => {
  state.status = "paused";
  for (const player of state.players) {
    player.worker.postMessage({ type: "game-paused" });
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
