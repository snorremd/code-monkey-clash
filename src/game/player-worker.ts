/**
 * player-worker.ts implements a worker thread that is responsible for
 * sending game questions to the player and receiving answers from the
 * player server. This worker thread is created when a player joins the
 * game and is terminated when the player leaves the game or the game stops.
 *
 * The worker game events from the main thread and sends game events back
 * to the main thread. E.g. when the player answers a question, the worker
 * checks if the answer is correct and sends the result back to the main thread.
 * The main thread then updates the game state accordingly.
 */
import type { GameEvent, PlayerEvent } from "./events";
import type { GameMode, GameStatus, PlayerLog } from "./state";
import { diffDates } from "../helpers";
import {
  adjustQuestionInterval,
  roundToQuestion,
  type QuestionType,
} from "./game";

// biome-ignore lint/style/noVar: Necessary for Web Workers
declare var self: Worker;
// Override postMessage type to only accept PlayerEvents
declare function postMessage(
  message: PlayerEvent,
  transfer?: Transferable[]
): void;

export interface PlayerWorker extends Worker {
  postMessage: (event: GameEvent) => void;
  onmessage: (event: MessageEvent<PlayerEvent>) => void;
}

interface WorkerState {
  /** Required to identify player when sending events to main thread */
  uuid: string;
  /** Player url to be able to send questions to player server */
  url: string;
  /** Current round number */
  round: number;
  /** Are we still playing or not? */
  status: GameStatus;
  /** Game mode: to determine which question set to use */
  mode?: GameMode;

  /** Counter, so we can id answers */
  counter: number;
  /** Question interval to adjust depending on player performance */
  questionInterval: number;
  /** Keep track of player score to allow adjusting question interval */
  scores: number[];
  /** Last question asked date time */
  lastQuestion?: Date;
  /** Timer object that runs the setTimeout so we can clear it when needed */
  timer?: Timer;
}

const workerState: WorkerState = {
  uuid: "",
  url: "",
  round: 0,
  status: "stopped",
  counter: 0,
  questionInterval: 10000,
  scores: [],
};

/**
 * Ask player a question defined by the question type.
 * The player server is expected to return the answer to the question.
 * If the player server returns an error or the request fails, the player is penalized.
 * If the player server returns a 200 response, the player is rewarded for a correct answer.
 * @param question The question type to ask the player, e.g. MathQuestion
 * @param now The current date time to log when the question was asked
 * @returns The player log with the question, answer, score, points, etc.
 */
async function askPlayerQuestion(
  question: QuestionType,
  now: Date
): Promise<PlayerLog> {
  const input = question.randomInput();
  const q = question.question(input);

  const log: PlayerLog = {
    date: now.toISOString(),
    question: q,
    score: workerState.scores[0] ?? 0,
    points: 0,
    questionInterval: workerState.questionInterval,
    id: workerState.counter++,
  };

  try {
    const response = await fetch(`${workerState.url}?q=${q}`);

    // If server returns error, penalize player and log error
    // We don't like server errors!
    if (response.status !== 200) {
      log.points = -10; // Penalize player for server error
      log.score = (workerState.scores[0] ?? 0) - 10;
      log.statusCode = response.status;
      log.error = response.statusText;
      return log;
    }

    // If they returned a 200 response check if they answered correctly
    const answer = await response.text();

    if (question.correctAnswer(answer, input)) {
      log.points = question.points;
      log.score = (workerState.scores[0] ?? 0) + question.points;
      log.statusCode = response.status;
      log.answer = answer;
    } else {
      log.points = -question.points; // Penalize player for wrong answer
      log.score = (workerState.scores[0] ?? 0) - 5;
      log.statusCode = response.status;
      log.answer = answer;
    }
    return log;

    // In the event that the fetch itself crashes, the player is penalized
    // We don't like downtime either!
  } catch (error) {
    console.error("Player", workerState.url, "error", error);

    let message = "";
    if (error instanceof Error) {
      message = error.message;
    }

    log.points = -15; // Penalize player for server error
    log.score = (workerState.scores[0] ?? 0) - 15;
    log.error = message;
    return log;
  }
}

async function gameLoop() {
  if (workerState.status !== "playing") {
    // Just in case, check we're still playing
    console.debug("Game loop stopped");
    return;
  }
  console.info(`Running player loop for ${workerState.uuid}`);
  // Calculate drift to subtract when calculating time to next question
  const now = new Date();
  const drift = diffDates(now, workerState.lastQuestion ?? now);

  workerState.lastQuestion = now;

  // Spawn new question immediately based on the interval and drift
  workerState.timer = setTimeout(
    gameLoop,
    workerState.questionInterval - drift
  );

  // Pick a random question based on the round and mode, ask player question, and update scores
  const randomQuestion = roundToQuestion(workerState);
  const log = await askPlayerQuestion(randomQuestion, now);
  workerState.scores.unshift(log.score);

  // Adjust question interval based on player performance
  workerState.questionInterval = adjustQuestionInterval(
    workerState.questionInterval,
    workerState.scores
  );

  // Send the log to the main thread
  postMessage({ type: "player-answer", uuid: workerState.uuid, log });
}

// Each worker
self.onmessage = (event: MessageEvent<GameEvent>) => {
  const { type } = event.data;
  switch (type) {
    case "player-joined":
      playerJoined(event.data);
      break;
    case "player-left":
      playerLeft();
      break;
    case "player-change-url":
      playerChangedUrl(event.data);
      break;
    case "game-started":
      gameStarted(event.data);
      break;
    case "game-stopped":
      gameStopped();
      break;
    case "game-paused":
      gamePaused();
      break;
    case "game-continued":
      gameContinued();
      break;
    case "change-round":
      workerState.round = event.data.round;
      break;
  }
};

self.onerror = (error) => {
  // Ensure we log any errors that occur in the worker
  console.error(error);
};

function playerJoined(event: Extract<GameEvent, { type: "player-joined" }>) {
  // Handle player joined, esentially set up initial worker state
  workerState.uuid = event.uuid;
  workerState.url = event.url;

  console.log("Player joined", workerState.uuid, workerState.url);
}

function playerChangedUrl(
  event: Extract<GameEvent, { type: "player-change-url" }>
) {
  // Handle player changed URL
  workerState.url = event.url;
}

function playerLeft() {
  // Handle player left, essentially stop the game loop
  workerState.status = "stopped";
  clearInterval(workerState.timer); // Clears any scheduled game loop invocations
  process.exit(0); // Terminate the worker thread
}

function gameStarted(data: Extract<GameEvent, { type: "game-started" }>) {
  workerState.status = "playing";
  workerState.mode = data.mode;
  gameLoop(); // side-effect: starts the game loop which will keep running
}

function gamePaused() {
  workerState.status = "paused";
  clearInterval(workerState.timer); // Clears any scheduled game loop invocations
}

function gameContinued() {
  workerState.status = "playing";
  gameLoop(); // side-effect: starts the game loop which will keep running
}

function gameStopped() {
  workerState.status = "stopped";
  clearInterval(workerState.timer); // Clears any scheduled game loop invocations
  process.exit(0); // Terminate the worker thread
}
