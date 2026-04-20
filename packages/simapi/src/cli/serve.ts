import { resolve } from "node:path";

import { tsImport } from "tsx/esm/api";

import type { SimAPIConfig } from "../core/defineConfig.js";
import { createAdapter } from "../db/index.js";
import { createApp } from "../server/createApp.js";
import { LogBus } from "../server/logBus.js";
import { startServer } from "../server/startServer.js";

export async function runServe(cwd: string = process.cwd()): Promise<void> {
  const configPath = resolve(cwd, "simapi.config.ts");
  const endpointsDir = resolve(cwd, "endpoints");

  let config!: SimAPIConfig;
  try {
    const mod = await tsImport(configPath, { parentURL: import.meta.url });
    config = (mod.default ?? mod) as SimAPIConfig;
  } catch (err) {
    console.error(`[SimAPI] Failed to load simapi.config.ts from ${cwd}`);
    console.error(err);
    process.exit(1);
  }

  const adapter = await createAdapter(config.database, cwd);
  const bus = new LogBus(adapter);

  const port = config.port ?? 3000;
  const app = await createApp(config, endpointsDir, bus);

  try {
    const { mountConsole } = await import("@simapi/console");
    mountConsole(app);
    console.log(`  Console at http://localhost:${port}/__simapi/console/\n`);
  } catch {
    // @simapi/console not installed — skip
  }

  startServer(app, port);

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      bus
        .close()
        .catch((err) => console.error("[SimAPI] shutdown error:", err));
    });
  }
}
