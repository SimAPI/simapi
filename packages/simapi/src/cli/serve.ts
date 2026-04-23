import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { consola } from "consola";

import { tsImport } from "tsx/esm/api";

import type { SimAPIConfig } from "../core/defineConfig.js";
import { createAdapter } from "../db/index.js";
import { createApp } from "../server/createApp.js";
import { LogBus } from "../server/logBus.js";
import { startServer } from "../server/startServer.js";

function loadEnv(cwd: string): void {
  const envPath = join(cwd, ".env");

  if (!existsSync(envPath)) return;

  try {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const t = line.trim();

      if (!t || t.startsWith("#")) continue;

      const i = t.indexOf("=");

      if (i < 1) continue;

      const key = t.slice(0, i).trim();

      const val = t
        .slice(i + 1)
        .trim()
        .replace(/^(['"])(.*)\1$/, "$2");

      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch {
    // ignore unreadable .env
  }
}

export async function runServe(cwd: string = process.cwd()): Promise<void> {
  loadEnv(cwd);

  const configPath = resolve(cwd, "simapi.config.ts");

  let config!: SimAPIConfig;
  try {
    const mod = await tsImport(configPath, { parentURL: import.meta.url });
    config = (mod.default ?? mod) as SimAPIConfig;
  } catch (err) {
    consola.error(`[SimAPI] Failed to load simapi.config.ts from ${cwd}`);
    consola.error(err);
    process.exit(1);
  }

  const adapter = await createAdapter(config.database, cwd);
  const bus = new LogBus(adapter);

  const port = config.port ?? 3000;
  const endpointsDir = resolve(cwd, config.endpointsDir ?? "src/endpoints");
  const app = await createApp(config, endpointsDir, bus);

  let consoleMounted = false;
  try {
    const { mountConsole } = await import("@simapi/console");
    mountConsole(app);
    consoleMounted = true;
  } catch {
    // @simapi/console not installed — skip
  }

  const server = startServer(app, port, (actualPort) => {
    if (consoleMounted) {
      consola.info(
        `Console at http://localhost:${actualPort}/__simapi/console/`
      );
    }
  });

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, async () => {
      server.close();

      if (bus) {
        await bus.close().catch((err) => {
          consola.error("[SimAPI] shutdown error:", err);
        });
      }

      process.exit(0);
    });
  }
}
