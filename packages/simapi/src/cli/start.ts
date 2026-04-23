import { fork } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import consola from "consola";

export function runStart(cwd: string = process.cwd()): void {
  const serverEntry = resolve(cwd, ".simapi", "dist", "server.mjs");

  if (!existsSync(serverEntry)) {
    consola.error(
      "[SimAPI] No compiled server found at .simapi/dist/server.mjs"
    );
    consola.error("         Run `npm run build` first.");
    process.exit(1);
  }

  const child = fork(serverEntry, [], {
    execArgv: [],
    stdio: "inherit",
    cwd,
  });

  child.on("error", (err) => {
    consola.error("[SimAPI] Failed to start server:", err);
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });

  // Forward signals to child
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => child.kill(signal));
  }
}
