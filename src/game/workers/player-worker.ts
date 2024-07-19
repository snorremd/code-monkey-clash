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
import type { MainWorkerEvent, PlayerWorkerEvent } from "../events";
import {
	type QuestionType,
	adjustIntervalLinear,
	defaultInterval,
	roundToQuestion,
} from "../game";
import type { GameMode, GameStatus, PlayerLog } from "../state";

interface PlayerWorker extends Worker {
	postMessage: (event: PlayerWorkerEvent) => void;
	onmessage: (event: MessageEvent<MainWorkerEvent>) => void;
}

// biome-ignore lint/style/noVar: Necessary for Web Workers
declare var self: PlayerWorker;

// Override postMessage type to only accept PlayerEvents
declare function postMessage(
	message: PlayerWorkerEvent,
	transfer?: Transferable[],
): void;

/**
 * Worker state keeps track of the player's game loop state.
 * This includes the question counter, points, question interval, etc.
 * Using this state we can start and stop the game loop, adjust question
 * interval, and more.
 *
 * Some basic player info including the UUID, nick, and URL are also stored.
 * The UUID and nick are used to identify the player when sending events to
 * the main thread. The URL is used to send questions to the player server.
 */
export interface WorkerState {
	/** Required to identify player when sending events to main thread */
	uuid: string;
	/** Player nickname, makes it easier to handle UI events without revealing UUID */
	nick: string;
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

/**
 * Initial worker state for the player worker.
 */
const workerState: WorkerState = {
	uuid: "",
	nick: "",
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
	log: PlayerLog,
): Promise<PlayerLog> {
	workerState.counter++;
	const input = question.randomInput();
	const q = question.questionWithInput(input);
	log.question = q;

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

		if (question.answerIsCorrect(answer, input)) {
			workerState.correct++;
			log.answerRatio = workerState.correct / workerState.counter;
			log.points = question.points;
			log.score = (workerState.scores[0] ?? 0) + question.points;
			log.answerRatio;
			log.statusCode = response.status;
			log.answer = answer;
		} else {
			log.points = -question.points; // Penalize player for wrong answer
			log.score = (workerState.scores[0] ?? 0) - Math.ceil(question.points / 3);
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

	// Track when we ask the questions
	const now = new Date().getTime();
	workerState.lastQuestion = now;

	// Spawn new question immediately based on the interval
	workerState.timer = setTimeout(gameLoop, workerState.questionInterval);

	// Pick a random question based on the round and mode, ask player question, and update scores
	const randomQuestion = roundToQuestion(workerState);

	let log: PlayerLog = {
		date: now,
		question: "",
		score: workerState.scores[0] ?? 0,
		points: 0,
		answerRatio: workerState.correct / workerState.counter, // If answer is wrong
		questionInterval: workerState.questionInterval,
		id: workerState.counter,
	};

	log = await askPlayerQuestion(randomQuestion, log);

	// Keep track of last 20 scores
	// Insert new score into the front of the array and remove the last score

	workerState.scores.unshift(log.score) > 20 && workerState.scores.pop();

	// Adjust question interval based on player performance
	workerState.questionInterval = adjustIntervalLinear(
		workerState.questionInterval,
		log.points,
	);

	// Notify main worker that we've got an answer (or not)
	postMessage({
		type: "player-answer",
		uuid: workerState.uuid,
		nick: workerState.nick,
		log,
	});
}

function startGameLoop(): Timer {
	console.log(
		`Starting game loop for ${workerState.nick} in ${
			workerState.questionInterval / 1000
		}s`,
	);
	return setTimeout(() => gameLoop(), workerState.questionInterval);
}

// Each worker
self.onmessage = (event: MessageEvent<MainWorkerEvent>) => {
	const { type } = event.data;
	let quit = false;
	switch (type) {
		case "player-joined":
			playerJoined(workerState, event.data);
			break;
		case "player-left":
			playerLeft(workerState);
			quit = true;
			break;
		case "player-change-url":
			playerChangedUrl(workerState, event.data);
			break;
		case "game-started":
			gameStarted(workerState, event.data, startGameLoop);
			break;
		case "game-stopped":
			gameStopped(workerState);
			quit = true;
			break;
		case "game-ended":
			gameStopped(workerState);
			quit = true;
			break;
		case "game-paused":
			gamePaused(workerState);
			break;
		case "game-continued":
			gameContinued(workerState, startGameLoop);
			break;
		case "change-round":
			workerState.round = event.data.round;
			break;
	}

	if (quit) {
		console.log("Quitting worker", workerState.nick);
		process.exit();
	}
};

self.onerror = (error) => {
	// Ensure we log any errors that occur in the worker
	console.error(error);
};

export function playerJoined(
	state: WorkerState,
	event: Extract<MainWorkerEvent, { type: "player-joined" }>,
) {
	// Handle player joined, esentially set up initial worker state
	state.uuid = event.uuid;
	state.nick = event.nick;
	state.url = event.url;
}

export function playerChangedUrl(
	state: WorkerState,
	event: Extract<MainWorkerEvent, { type: "player-change-url" }>,
) {
	state.url = event.url;
}

export function playerLeft(state: WorkerState) {
	clearTimeout(state.timer);
	state.timer = undefined;
	state.status = "stopped";
}

export function gameStarted(
	state: WorkerState,
	data: Extract<MainWorkerEvent, { type: "game-started" }>,
	fn: () => Timer,
) {
	state.status = "playing";
	state.mode = data.mode;
	state.round = data.round;
	state.timer = fn();
}

export function gamePaused(state: WorkerState) {
	clearTimeout(state.timer);
	state.status = "paused";
	state.timer = undefined;
}

export function gameContinued(state: WorkerState, fn: () => Timer) {
	state.status = "playing";
	state.timer = fn();
}

export function gameStopped(workerState: WorkerState) {
	clearTimeout(workerState.timer);
	workerState.timer = undefined;
	workerState.status = "stopped";
}
