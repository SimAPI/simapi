import { resolve } from "node:path";

import { tsImport } from "tsx/esm/api";

import type { SimAPIConfig } from "../core/defineConfig.js";
import { createApp } from "../server/createApp.js";
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

  const port = config.port ?? 3000;
  const app = await createApp(config, endpointsDir);
  startServer(app, port);
}
