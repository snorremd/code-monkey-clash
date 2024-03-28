import { changeScore, type Player, type State } from "../state";
import { testQuestions, gameQuestions, type Question } from "./questions";

const minInterval = 5;
const maxInterval = 15;
const intervalStep = 1;

const adjustRate = (player: Player) => {
  const trend = player.log
    .slice(0, 20)
    .reduce((acc, log) => acc + (log.points > 0 ? 1 : -1), 0);

  if (trend > 0.75) {
    // Player has a very positive trend so start reducing question interval
    player.question_interval = Math.max(
      minInterval,
      player.question_interval - intervalStep
    );
  } else if (trend > 0) {
    // Player is recovering from a negative trend, so increase question interval
    player.question_interval = Math.min(
      maxInterval,
      player.question_interval + intervalStep
    );
  } else {
    // Player has a negative trend, so decrease question interval quickly
    player.question_interval = Math.min(
      maxInterval,
      player.question_interval + intervalStep * 2
    );
  }
};

const rateLimit = (player: Player) => {
  const lastLog = player.log[0];
  const drift = new Date().getTime() - lastLog.date.getTime();
  return player.question_interval * 1000 - drift;
};

type QuestionInput =
  | string
  | number
  | number[]
  | [number, number]
  | [number[], number]; // Adjust based on actual types
type QuestionType = Question<QuestionInput>;

function roundToQuestion({ round, mode }: State, player: Player): QuestionType {
  const questions = mode === "demo" ? testQuestions : gameQuestions;
  // Pick among questions based on round, make sliding window
  const windowEnd = round * 2 - 1;
  const windowStart = Math.max(windowEnd - 4, 0);
  const availableQuestions = questions.slice(windowStart, windowEnd);
  return availableQuestions[
    Math.floor(Math.random() * availableQuestions.length)
  ];
}

export async function askPlayerQuestion(state: State, player: Player) {
  // Drift is elapsed time - expected time. Subtract drift from next question interval
  let drift = 0;
  const now = new Date();
  if (player.log.length > 0) {
    const previous = player.log[0].date;
    const elapsed = now.getTime() - new Date(previous).getTime();
    drift = elapsed - player.question_interval * 1000;
  }
  // Set new question interval
  adjustRate(player);

  setTimeout(
    () => askPlayerQuestion(state, player),
    player.question_interval * 1000 - drift
  );

  if (state.status === "stopped" || !player.playing) {
    // If game or player has stopped, kill loop
    return;
  }

  // Ugly type casting to ensure different task functions accept the same type
  const task = roundToQuestion(state, player);

  const input = task.randomInput();
  const question = task.question(input);

  const nextLog = {
    date: now.toISOString(),
    question,
    score: 0,
    points: 0,
  };

  player.log.unshift(nextLog);

  try {
    const response = await fetch(`${player.url}?q=${question}`);
    if (response.status !== 200) {
      changeScore({
        state,
        player,
        log: nextLog,
        points: -5,
        statusCode: response.status,
      });
    } else if (response.ok) {
      const answer = await response.text();
      if (task.correctAnswer(answer, input)) {
        changeScore({
          state,
          player,
          log: nextLog,
          points: 10,
          answer,
        });
      } else {
        changeScore({
          state,
          player,
          log: nextLog,
          points: -5,
          answer,
        });
      }
    }
  } catch (error) {
    console.error("Player", player.nick, "error", error);
    let message = "";
    if (error instanceof Error) {
      message = error.message;
    }
    changeScore({
      state,
      player,
      log: nextLog,
      points: -5,
      error: message,
    });
  }
}
