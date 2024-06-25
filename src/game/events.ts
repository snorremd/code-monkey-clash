import type { GameMode, Player, PlayerLog } from "./state";

/**
 * First event sent to player worker thread after a player joins
 * the game and the worker is created.
 */
interface PlayerJoined extends Pick<Player, "uuid" | "url"> {
  type: "player-joined";
}

/**
 * Event sent to player worker thread when a player leaves the game.
 * At this point the worker thread should be terminated.
 */
interface PlayerLeft extends Pick<Player, "uuid"> {
  type: "player-left";
}

/**
 * Update player URL, in case the player entered wrong URL initially.
 */
interface PlayerChangeUrl {
  type: "player-change-url";
  uuid: string;
  url: string;
}

/**
 * Event sent to player worker thread when the game starts.
 */
interface GameStarted {
  type: "game-started";
  mode: GameMode;
}

/**
 * Event sent to player worker thread when the game stops.
 * This event is sent when the game is stopped by the host.
 * The worker thread should be terminated after this event.
 */
interface GameStopped {
  type: "game-stopped";
}

/**
 * Event sent to player worker thread when the game pauses.
 * This event is sent when the game is paused by the host.
 * Should not terminate the worker thread.
 */
interface GamePaused {
  type: "game-paused";
}

/**
 * Event sent to player worker thread when the game continues
 * after being paused.
 * Should resume the game loop.
 */
interface GameContinued {
  type: "game-continued";
}

/**
 * Event sent when the host moves to a different round.
 * This allows us to go to next, previous or any other round.
 */
interface ChangeRound {
  type: "change-round";
  round: number;
}

/**
 * Event sent to main thread when a player is asked a question.
 * This contains the initial question log data, but no answer.
 * The player worker sends a PlayerAnswer event when the player answers.
 */
interface PlayerQuestion {
  type: "player-question";
  uuid: string;
  log: PlayerLog;
}
/**
 * Event sent to main thread when a player answers a question.
 * Contains the player log event with details about the answer.
 * E.g. whether the answer was correct, the score, etc.
 */
interface PlayerAnswer {
  type: "player-answer";
  uuid: string;
  log: PlayerLog;
}

/**
 * Event sent when the player worker thread stops in
 * response to the game stopping or the player leaving.
 */
interface PlayerStopped {
  type: "player-stopped";
  uuid: string;
}

/** Events fired by the main worker in response to game events */
export type MainWorkerEvent =
  | PlayerJoined
  | PlayerLeft
  | PlayerChangeUrl
  | GameStarted
  | GameStopped
  | GamePaused
  | GameContinued
  | ChangeRound;

/** Events fired by the player worker like when player has answered question */
export type PlayerWorkerEvent = PlayerAnswer | PlayerQuestion | PlayerStopped;

/** All game events regardless of main or player worker so UI can update accordingly */
export type GameEvent = MainWorkerEvent | PlayerWorkerEvent;
