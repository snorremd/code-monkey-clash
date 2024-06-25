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
import type { MainWorkerEvent, PlayerWorkerEvent } from "./events";
import type { GameMode, GameStatus, PlayerLog } from "./state";
import {
  adjustQuestionInterval,
  defaultInterval,
  roundToQuestion,
  type QuestionType,
} from "./game";

// biome-ignore lint/style/noVar: Necessary for Web Workers
declare var self: Worker;
// Override postMessage type to only accept PlayerEvents
declare function postMessage(
  message: PlayerWorkerEvent,
  transfer?: Transferable[]
): void;

export interface PlayerWorker extends Worker {
  postMessage: (event: MainWorkerEvent) => void;
  onmessage: (event: MessageEvent<PlayerWorkerEvent>) => void;
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
  /** Count correct answers so we can calculate answer ratio */
  correct: number;
  /** Question interval to adjust depending on player performance */
  questionInterval: number;
  /** Keep track of player score to allow adjusting question interval */
  scores: number[];
  /** Last question asked date time */
  lastQuestion?: number;
  /** Timer object that runs the setTimeout so we can clear it when needed */
  timer?: Timer;
}

const workerState: WorkerState = {
  uuid: "",
  url: "",
  round: 0,
  status: "stopped",
  counter: 0,
  correct: 0,
  questionInterval: defaultInterval,
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
  log: PlayerLog
): Promise<PlayerLog> {
  workerState.counter++;
  const input = question.randomInput();
  const q = question.question(input);

  try {
    const response = await fetch(`${workerState.url}?q=${q}`);

    // If server returns error, penalize player and log error
    // We don't like server errors!
    if (response.status !== 200) {
      log.points = -10; // Penalize player for server error
      log.score = (workerState.scores[0] ?? 0) - 10;
      log.error = response.statusText;
      return log;
    }

    // If they returned a 200 response check if they answered correctly
    const answer = await response.text();

    if (question.correctAnswer(answer, input)) {
      workerState.correct++;
      log.answerRatio = workerState.correct / workerState.counter;
      log.points = question.points;
      log.score = (workerState.scores[0] ?? 0) + question.points;
      log.answerRatio;
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
    console.log("Game loop stopped");
    return;
  }
  console.info(`Running player loop for ${workerState.uuid}`);

  // Calculate drift to subtract when calculating time to next question
  const { lastQuestion, questionInterval } = workerState;
  const now = new Date().getTime();
  const drift = lastQuestion ? now - (lastQuestion + questionInterval) : 0;

  console.log("Drift", drift);
  console.log("Schedule", workerState.questionInterval - drift);

  workerState.lastQuestion = now;

  // Spawn new question immediately based on the interval and drift
  workerState.timer = setTimeout(gameLoop, workerState.questionInterval);

  // Pick a random question based on the round and mode, ask player question, and update scores
  const randomQuestion = roundToQuestion(workerState);

  let log: PlayerLog = {
    date: new Date(now).toISOString(),
    question: randomQuestion.question(randomQuestion.randomInput()),
    score: workerState.scores[0] ?? 0,
    points: 0,
    answerRatio: workerState.correct / workerState.counter, // If answer is wrong
    questionInterval: workerState.questionInterval,
    id: workerState.counter,
  };

  // Notify main thread that we're asking a question

  log = await askPlayerQuestion(randomQuestion, log);
  workerState.scores.unshift(log.score);

  // Adjust question interval based on player performance
  workerState.questionInterval = adjustQuestionInterval(
    workerState.questionInterval,
    workerState.scores
  );

  // Notify main worker that we've got an answer (or not)
  postMessage({ type: "player-answer", uuid: workerState.uuid, log });
}

function startGameLoop() {
  workerState.timer = setTimeout(
    async () => await gameLoop(),
    workerState.questionInterval
  );
}

// Each worker
self.onmessage = (event: MessageEvent<MainWorkerEvent>) => {
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

function playerJoined(
  event: Extract<MainWorkerEvent, { type: "player-joined" }>
) {
  // Handle player joined, esentially set up initial worker state
  workerState.uuid = event.uuid;
  workerState.url = event.url;

  console.log("Player joined", workerState.uuid, workerState.url);
}

function playerChangedUrl(
  event: Extract<MainWorkerEvent, { type: "player-change-url" }>
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

function gameStarted(data: Extract<MainWorkerEvent, { type: "game-started" }>) {
  console.log("Game started for player", workerState.uuid);
  workerState.status = "playing";
  workerState.mode = data.mode;
  startGameLoop();
}

function gamePaused() {
  console.log("Game paused for player", workerState.uuid);
  workerState.status = "paused";
  clearInterval(workerState.timer); // Clears any scheduled game loop invocations
}

function gameContinued() {
  console.log("Game continued for player", workerState.uuid);
  workerState.status = "playing";
  startGameLoop(); // side-effect: starts the game loop which will keep running
}

function gameStopped() {
  console.log("Game stopped for player", workerState.uuid);
  clearInterval(workerState.timer); // Clears any scheduled game loop invocations
  workerState.status = "stopped";
  process.exit(0); // Terminate the worker thread
}
