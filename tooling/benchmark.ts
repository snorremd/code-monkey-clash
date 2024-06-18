// Run all benchmarks in the project, e.g. all files matching `src/**/*.bench.ts`
// Use Bun to find all the files and run them

import { spawn } from "bun";

async function runBenchmarks() {
  try {
    // Find all files matching the pattern
    const glob = new Bun.Glob("src/**/*.bench.ts");
    const files = await glob.scanSync();

    for (const file of files) {
      console.log(`Running benchmark: ${file}`);
      // Run the file using Bun
      const process = spawn({
        cmd: ["bun", "run", file],
        stdout: "inherit",
        stderr: "inherit",
      });

      const exitCode = await process?.exited;
      if (exitCode !== 0) {
        console.error(`Benchmark failed: ${file}`);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

runBenchmarks();
