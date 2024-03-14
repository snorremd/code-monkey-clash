import { Elysia } from "elysia";

const stateLocation = "./state.json"

export interface PlayerLog {
  date: Date;
  score: number;
  points: number;
  question: string;
  answer?: string;
  response?: number | 'timeout' | 'error';
}

export interface Player {
  uuid: string;
  nick: string;
  url: string;
  playing: boolean;
  log: PlayerLog[];
}

export interface State {
  status: 'test' | 'game' | 'stopped';
  players: Player[]
}


async function loadState() {
  return await Bun.file(stateLocation).exists() ? await Bun.file(stateLocation).json() : {
    players: [],
    state: 'stopped'
  };
}

async function saveState(state: State) {
  const content = JSON.stringify(state, null, 2);
  const writer = Bun.file(stateLocation).writer();
  await writer.write(content);
  await writer.end();
}

type CreatePlayer = Pick<Player, "nick" | "url">;

export const addPlayer = (state: State, playerPayload: CreatePlayer) => {
  const newPlayer = { ...playerPayload, uuid: crypto.randomUUID(), log: [], playing: true};
  state.players.push(newPlayer);
  saveState(state)
  return newPlayer.uuid;
};

export const removePlayer = (state: State, uuid: string) => {
  state.players = state.players.filter(p => p.uuid !== uuid);
  saveState(state)
};

export const plugin = new Elysia().state("state", (await loadState()) as State);
