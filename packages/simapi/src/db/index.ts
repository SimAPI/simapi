import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type { DatabaseConfig } from "../core/defineConfig.js";
import { createNoneAdapter } from "./adapters/none.js";
import { createSqliteAdapter } from "./adapters/sqlite.js";

export type { DbAdapter, RequestLogEntry } from "./types.js";

export async function createAdapter(
  config: DatabaseConfig | undefined,
  cwd: string
): Promise<DbAdapter> {
  if (!config || config.type === "none") {
    return createNoneAdapter();
  }

  if (config.type === "sqlite") {
    const absPath = resolve(cwd, config.path);
    await mkdir(dirname(absPath), { recursive: true });
    return createSqliteAdapter(`file:${absPath}`);
  }

  if (config.type === "libsql") {
    return createSqliteAdapter(config.url, config.authToken);
  }

  if (config.type === "postgres") {
    const { createPostgresAdapter } = await import("./adapters/postgres.js");
    return createPostgresAdapter(config.url);
  }

  return createNoneAdapter();
}
