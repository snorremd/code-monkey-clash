/**
 * This module simulates a game with multiple players.
 * It runs the server and creates players using the solutions
 * in example-players.
 *
 * The module will open the admin page in the browser when the servers
 * are up and running. From there you can start the game and
 * then watch the admin board and scoreboard to see the game progress.
 *
 * Example: bun simulate 6
 */

import { spawn } from "bun";
import { nanoid } from "nanoid";

// List of 50 random nicks to use for the players when simulating the game
const nicks = [
  "CodeMaster007",
  "DebugWarrior",
  "BinaryBrawler",
  "ScriptSorcerer",
  "BitwiseBoss",
  "SyntaxSamurai",
  "CompileCommander",
  "HackHero",
  "NerdNinja",
  "GeekGenius",
  "AlgorithmAce",
  "CodeCrafter",
  "VariableViking",
  "FunctionFreak",
  "DataDynamo",
  "LogicLord",
  "PixelPioneer",
  "ByteBandit",
  "CipherChampion",
  "LoopLunatic",
  "RecursiveRanger",
  "CompileConqueror",
  "NullNinja",
  "RefactorRaptor",
  "SnippetSage",
  "DebuggerDiva",
  "BooleanBoss",
  "ScriptSlinger",
  "HexHacker",
  "TerminalTitan",
  "CodeCrusader",
  "AlgoAlchemist",
  "ScriptSensei",
  "BooleanBeast",
  "BinaryBaron",
  "RecursiveRuler",
  "LogicLover",
  "FunctionFreak",
  "ArrayAvenger",
  "CryptoCraze",
  "RefactorRogue",
  "SyntaxSultan",
  "DebuggerDemon",
  "CompileCaptain",
  "CodeCrusher",
  "LoopLover",
  "DataDruid",
  "ScriptShaman",
  "HexHero",
  "TerminalTactician",
];

// Spawn a maximum of 50 players as we don't have more nicks to choose from :)
const numberOfPlayer = Math.min(Number.parseInt(Bun.argv[2] ?? "6"), 50);
const glob = new Bun.Glob("example-players/*.player.ts");
const playerScripts = Array.from(glob.scanSync());

const tempState = `/tmp/${nanoid()}.json`;

console.log(`Spawning ${numberOfPlayer} players`);
for (let index = 0; index < numberOfPlayer; index++) {
  // Ensure each player has a unique port and nick
  const playerPort = 3001 + index;
  const nick = nicks[index];
  const process = spawn({
    cmd: ["bun", "run", playerScripts[index % playerScripts.length]],
    env: {
      CMC_PLAYER_PORT: playerPort.toString(),
      CMC_PLAYER_NICK: nick,
    },
    stdout: "inherit",
    stderr: "inherit",
  });

  process?.exited.then((code) => {
    console.log(`Player ${nick} exited with code ${code}`);
  });
}

// Spawn the game server
const gameServer = spawn({
  cmd: ["bun", "run", "./src/index.tsx"],
  env: {
    CMC_STATE_FILE: tempState,
    CMC_SECRET: "hunter2",
  },
  stdout: "inherit",
  stderr: "inherit",
});

gameServer?.exited.then((code) => {
  console.log(`Game server exited with code ${code}`);
  process.exit(code);
});

// Wait for the game server to start
await new Promise((resolve) => setTimeout(resolve, 2000));

// Signup each player with the game server
for (let i = 0; i < numberOfPlayer; i++) {
  const playerPort = 3001 + i;
  const nick = nicks[i];
  const form = new FormData();
  form.append("nick", nick);
  form.append("url", `http://localhost:${playerPort}`);

  // Make a URL-encoded form body post request to the server
  const res = await fetch("http://localhost:3000/signup", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    console.error(`Failed to signup player ${nick}`);
  }
}

// Open browser at the game server admin page
spawn({
  cmd: ["open", "http://localhost:3000/admin"],
  stdout: "inherit",
  stderr: "inherit",
});
