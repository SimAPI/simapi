import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, resolve as resolvePath, sep } from "node:path";
import { fileURLToPath } from "node:url";

import type { Hono } from "hono";

const dir = dirname(fileURLToPath(import.meta.url));
const spaDir = join(dir, "spa");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

export function mountConsole(app: Hono): void {
  app.get("/__simapi/console", (c) => c.redirect("/__simapi/console/"));

  app.all("/__simapi/console/*", async (c) => {
    const urlPath = c.req.path.replace(/^\/__simapi\/console/, "") || "/";
    const ext = extname(urlPath);
    const candidate =
      ext && urlPath !== "/"
        ? join(spaDir, urlPath)
        : join(spaDir, "index.html");

    // Prevent path traversal: resolved path must stay within spaDir
    const resolved = resolvePath(candidate);
    const safe = resolved.startsWith(spaDir + sep) || resolved === spaDir;
    const target =
      safe && existsSync(resolved) ? resolved : join(spaDir, "index.html");

    const content = await readFile(target);
    const mime = MIME[extname(target)] ?? "application/octet-stream";
    return new Response(content, { headers: { "content-type": mime } });
  });
}
