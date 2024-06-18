import { Elysia } from "elysia";

const stateLocation = "./state.json";

export interface PlayerLog {
	date: string;
	score: number;
	points: number;
	question: string;
	answer?: string;
	statusCode?: number;
	error?: string;
}

export interface Player {
	uuid: string;
	nick: string;
	url: string;
	playing: boolean;
	score: number;
	question_interval: number;
	log: PlayerLog[];
}

export interface State {
	mode?: "demo" | "game";
	status: "playing" | "paused" | "stopped";
	gameStartedAt?: string; // ISO date time
	roundStartedAt?: string; // ISO date time
	round: number;
	players: Player[];
}

async function loadState() {
	return (await Bun.file(stateLocation).exists())
		? await Bun.file(stateLocation).json()
		: ({
				round: 1,
				players: [],
				status: "stopped",
			} satisfies State);
}

async function saveState(state: State) {
	const content = JSON.stringify(state, null, 2);
	const writer = Bun.file(stateLocation).writer();
	await writer.write(content);
	await writer.end();
}

type CreatePlayer = Pick<Player, "nick" | "url">;

export const addPlayer = (state: State, playerPayload: CreatePlayer) => {
	const newPlayer = {
		...playerPayload,
		uuid: crypto.randomUUID(),
		log: [],
		question_interval: 10,
		score: 0,
		playing: true,
	} satisfies Player;
	state.players.push(newPlayer);
	saveState(state);
	return newPlayer.uuid;
};

export const removePlayer = (state: State, uuid: string) => {
	state.players = state.players.filter((p) => p.uuid !== uuid);
	saveState(state);
};

export const startGame = (state: State, mode: State["mode"]) => {
	state.status = "playing";
	state.mode = mode;
	state.gameStartedAt = new Date().toISOString();
	state.roundStartedAt = new Date().toISOString();
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

const state = await loadState();

export const plugin = new Elysia().state("state", state as State);
