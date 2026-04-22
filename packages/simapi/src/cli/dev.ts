import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, watch } from "node:fs";
import { resolve } from "node:path";

import * as p from "@clack/prompts";

export async function runDev(cwd: string = process.cwd()): Promise<void> {
  p.intro("SimAPI — dev mode");

  const simapiBin = process.argv[1] as string;
  let child: ChildProcess | null = null;
  let debounce: ReturnType<typeof setTimeout> | null = null;

  function start() {
    child = spawn(process.execPath, [simapiBin, "serve", cwd], {
      stdio: "inherit",
      cwd,
    });
  }

  function restart() {
    p.log.info("Change detected — restarting...");
    if (child) {
      child.kill("SIGTERM");
      child = null;
    }
    setTimeout(start, 150);
  }

  function scheduleRestart() {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(restart, 300);
  }

  const srcDir = resolve(cwd, "src");
  const configFile = resolve(cwd, "simapi.config.ts");

  if (existsSync(srcDir)) {
    watch(srcDir, { recursive: true }, scheduleRestart);
  } else {
    p.log.warn("src/ directory not found — watching only simapi.config.ts");
  }

  if (existsSync(configFile)) {
    watch(configFile, scheduleRestart);
  }

  p.log.info("Watching src/ and simapi.config.ts — press Ctrl+C to stop");

  start();

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      child?.kill("SIGTERM");
      process.exit(0);
    });
  }
}
