import { readdir } from "node:fs/promises";
import { extname, join } from "node:path";

import { tsImport } from "tsx/esm/api";

import type { EndpointDefinition } from "../core/endpoint.js";

export async function discoverEndpoints(
  dir: string
): Promise<EndpointDefinition[]> {
  const endpoints: EndpointDefinition[] = [];
  const files = await scanDir(dir);

  for (const file of files) {
    const mod = await tsImport(file, { parentURL: import.meta.url });
    for (const exported of Object.values(mod as Record<string, unknown>)) {
      if (isEndpointDefinition(exported)) {
        endpoints.push(exported);
      }
    }
  }

  return endpoints;
}

async function scanDir(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") {
        continue;
      }
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await scanDir(fullPath)));
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        if ([".ts", ".js", ".mts", ".mjs"].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read — return empty
  }

  return files;
}

function isEndpointDefinition(value: unknown): value is EndpointDefinition {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.path === "string" &&
    typeof v.method === "string" &&
    typeof v.type === "string" &&
    typeof v.handler === "function"
  );
}
