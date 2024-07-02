import { describe, it, expect } from "bun:test";
import {
  fromPartial,
  type PartialDeepObject,
} from "@total-typescript/shoehorn";
import {
  gameContinued,
  gamePaused,
  gameStarted,
  gameStopped,
  playerChangedUrl,
  playerJoined,
  playerLeft,
  type WorkerState,
} from "./player-worker";

describe("player-worker", () => {
  describe(playerJoined.name, () => {
    it("should set up initial worker state", () => {
      const workerState: PartialDeepObject<WorkerState> = {
        status: "stopped",
        timer: undefined,
      };

      playerJoined(fromPartial(workerState), {
        type: "player-joined",
        uuid: "123",
        nick: "test",
        url: "http://example.com",
      });

      expect(workerState).toEqual(
        fromPartial({
          status: "stopped",
          timer: undefined,
          uuid: "123",
          nick: "test",
          url: "http://example.com",
        })
      );
    });
  });

  describe(playerChangedUrl.name, () => {
    it("should update player URL", () => {
      const workerState: PartialDeepObject<WorkerState> = {
        uuid: "123",
        url: "http://example.com",
      };

      playerChangedUrl(fromPartial(workerState), {
        type: "player-change-url",
        uuid: "123",
        url: "http://example2.com",
      });

      expect(workerState).toEqual(
        fromPartial({
          uuid: "123",
          url: "http://example2.com",
        })
      );
    });
  });

  describe(playerLeft.name, () => {
    it('should set status to "stopped" and clear timer', () => {
      const workerState: PartialDeepObject<WorkerState> = {
        status: "playing",
        timer: setTimeout(() => {}, 1000),
      };

      playerLeft(fromPartial(workerState));

      expect(workerState).toEqual(
        fromPartial({
          status: "stopped",
          timer: undefined,
        })
      );
    });
  });

  describe(gameStarted.name, () => {
    it('should set status to "playing" and set mode', () => {
      const workerState: PartialDeepObject<WorkerState> = {
        status: "stopped",
        timer: undefined,
      };

      gameStarted(
        fromPartial(workerState),
        {
          type: "game-started",
          mode: "demo",
          round: 1,
        },
        () => setTimeout(() => {}, 100)
      );

      expect(workerState).toEqual(
        fromPartial({
          status: "playing",
          mode: "demo",
          round: 1,
          timer: expect.any(Object),
        })
      );

      expect(workerState.timer?.ref).toBeDefined();
    });
  });

  describe(gameContinued.name, () => {
    it('should set status to "playing"', () => {
      const workerState: PartialDeepObject<WorkerState> = {
        status: "paused",
        timer: undefined,
      };
      gameContinued(fromPartial(workerState), () => setTimeout(() => {}, 100));

      expect(workerState).toEqual(
        fromPartial({
          status: "playing",
          timer: expect.any(Object),
        })
      );

      expect(workerState.timer?.ref).toBeDefined();
    });
  });

  describe(gamePaused.name, () => {
    it('should set status to "paused" and clear timer', () => {
      const workerState: PartialDeepObject<WorkerState> = {
        status: "playing",
        timer: setTimeout(() => {}, 1000),
      };

      gamePaused(fromPartial(workerState));

      expect(workerState).toEqual(
        fromPartial({
          status: "paused",
          timer: undefined,
        })
      );
    });
  });

  describe(gameStopped.name, () => {
    it('should set status to "stopped" and clear timer', () => {
      const workerState: PartialDeepObject<WorkerState> = {
        status: "playing",
        timer: setTimeout(() => {}, 1000),
      };

      gameStopped(fromPartial(workerState));

      expect(workerState).toEqual(
        fromPartial({
          status: "stopped",
          timer: undefined,
        })
      );
    });
  });
});
