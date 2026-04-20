import { createClient } from "@libsql/client";
import { desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { DbAdapter, RequestLogEntry } from "../types.js";

const requestLogs = sqliteTable("request_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  method: text("method").notNull(),
  path: text("path").notNull(),
  query: text("query").notNull(),
  requestHeaders: text("request_headers").notNull(),
  requestBody: text("request_body").notNull(),
  responseStatus: integer("response_status").notNull(),
  responseBody: text("response_body").notNull(),
  durationMs: integer("duration_ms").notNull(),
  timestamp: text("timestamp").notNull(),
});

export async function createSqliteAdapter(
  url: string,
  authToken?: string
): Promise<DbAdapter> {
  const client = createClient({ url, authToken });
  const db = drizzle(client);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS request_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      query TEXT NOT NULL,
      request_headers TEXT NOT NULL,
      request_body TEXT NOT NULL,
      response_status INTEGER NOT NULL,
      response_body TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);

  return {
    async log(entry) {
      await db.insert(requestLogs).values(entry);
    },
    async getLogs({ limit = 100, offset = 0 } = {}) {
      return db
        .select()
        .from(requestLogs)
        .orderBy(desc(requestLogs.id))
        .limit(limit)
        .offset(offset) as Promise<RequestLogEntry[]>;
    },
    async close() {
      client.close();
    },
  };
}
