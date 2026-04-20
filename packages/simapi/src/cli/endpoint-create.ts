import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import * as p from "@clack/prompts";

import { ENDPOINT_TS, fill } from "./templates.js";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

function cancelled(): void {
  p.cancel("Cancelled.");
}

export async function runEndpointCreate(
  cwd: string = process.cwd()
): Promise<void> {
  p.intro("SimAPI — new endpoint");

  const path = await p.text({
    message: "Path",
    placeholder: "/api/posts",
    validate: (v) =>
      v.trim().startsWith("/") ? undefined : "Path must start with /",
  });
  if (p.isCancel(path)) {
    cancelled();
    return;
  }

  const method = await p.select({
    message: "HTTP method",
    options: HTTP_METHODS.map((m) => ({ value: m, label: m })),
  });
  if (p.isCancel(method)) {
    cancelled();
    return;
  }

  const authType = await p.select({
    message: "Auth type",
    options: [
      { value: "open", label: "open — no auth required" },
      { value: "secure", label: "secure — runs authHandler" },
    ],
  });
  if (p.isCancel(authType)) {
    cancelled();
    return;
  }

  // Derive a filename and handler name from the path
  const slug =
    (path as string)
      .replace(/^\//, "")
      .replace(/[/:]/g, "-")
      .replace(/-+/g, "-")
      .replace(/-$/, "") || "endpoint";

  const handlerName = toHandlerName(method as string, path as string);
  const filename = `${slug}.ts`;
  const outPath = resolve(cwd, "endpoints", filename);

  if (existsSync(outPath)) {
    const overwrite = await p.confirm({
      message: `${filename} already exists. Overwrite?`,
      initialValue: false,
    });
    if (p.isCancel(overwrite) || !overwrite) {
      cancelled();
      return;
    }
  }

  const endpointsDir = resolve(cwd, "endpoints");
  await mkdir(endpointsDir, { recursive: true });

  const content = fill(ENDPOINT_TS, {
    handlerName,
    path: path as string,
    method: method as string,
    authType: authType as string,
    message: `${toTitleCase(slug)} handled successfully`,
  });

  await writeFile(outPath, content);

  p.outro(`Created endpoints/${filename}`);
}

function toHandlerName(method: string, path: string): string {
  const verb = method.toLowerCase();
  const parts = path
    .split("/")
    .filter(Boolean)
    .filter((seg) => !seg.startsWith(":"))
    .map((seg) => seg.replace(/[^a-zA-Z0-9]/g, ""));
  const noun = parts
    .map((seg) => (seg[0]?.toUpperCase() ?? "") + seg.slice(1))
    .join("");
  return `${verb}${noun || "Resource"}`;
}

function toTitleCase(str: string): string {
  return str
    .split("-")
    .map((w) => (w[0]?.toUpperCase() ?? "") + w.slice(1))
    .join(" ");
}
