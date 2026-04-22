import { existsSync } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

import * as p from "@clack/prompts";
import { tsImport } from "tsx/esm/api";

import type { SimAPIConfig } from "../core/defineConfig.js";

export type Platform = "node" | "vercel" | "netlify";

function detectPlatform(): Platform {
  if (process.env.VERCEL) return "vercel";
  if (process.env.NETLIFY) return "netlify";
  return "node";
}

function getPlatformConfig(
  cwd: string,
  platform: Platform
): { outDir: string; entryName: string } {
  switch (platform) {
    case "vercel":
      return { outDir: resolve(cwd, "api"), entryName: "index" };
    case "netlify":
      return {
        outDir: resolve(cwd, "netlify", "functions"),
        entryName: "api",
      };
    default:
      return { outDir: resolve(cwd, ".simapi", "dist"), entryName: "server" };
  }
}

export async function runBuild(
  cwd: string = process.cwd(),
  opts: { platform?: Platform } = {}
): Promise<void> {
  const platform = opts.platform ?? detectPlatform();

  p.intro(`SimAPI — build${platform !== "node" ? ` (${platform})` : ""}`);

  const configPath = resolve(cwd, "simapi.config.ts");
  if (!existsSync(configPath)) {
    p.cancel("simapi.config.ts not found. Are you in a SimAPI project?");
    process.exit(1);
  }

  let userConfig: SimAPIConfig | undefined;
  try {
    const mod = await tsImport(configPath, { parentURL: import.meta.url });
    userConfig = (mod.default ?? mod) as SimAPIConfig;
  } catch {
    // use defaults if config can't be loaded at build time
  }

  const { outDir, entryName } = getPlatformConfig(cwd, platform);
  const tmpDir = resolve(cwd, ".simapi", "_build");
  const endpointsDir = resolve(
    cwd,
    userConfig?.endpointsDir ?? "src/endpoints"
  );
  const authHandlerPath = resolve(cwd, "src/authHandler.ts");

  const s = p.spinner();
  s.start("Compiling project");

  try {
    // Discover endpoint files
    const endpointFiles = existsSync(endpointsDir)
      ? await scanTsFiles(endpointsDir)
      : [];

    const hasAuth = existsSync(authHandlerPath);

    // Build static imports for the production entry
    const importLines: string[] = [];
    const endpointVars: string[] = [];

    let i = 0;
    for (const file of endpointFiles) {
      const relPath = relative(tmpDir, file).replace(/\\/g, "/");
      const varName = `mod${i}`;
      importLines.push(`import * as ${varName} from "${relPath}";`);
      endpointVars.push(varName);
      i++;
    }

    const configRel = relative(tmpDir, configPath).replace(/\\/g, "/");
    const authRel = hasAuth
      ? relative(tmpDir, authHandlerPath).replace(/\\/g, "/")
      : null;

    const entry = buildProductionEntry({
      configRel,
      authRel,
      importLines,
      endpointVars,
      platform,
    });

    // Write temp entry
    await mkdir(tmpDir, { recursive: true });
    const entryPath = join(tmpDir, "server.ts");
    await writeFile(entryPath, entry);

    // Use tsdown programmatic API to bundle
    const { build } = await import("tsdown");
    await build({
      entry: { [entryName]: entryPath },
      outDir,
      format: ["esm"],
      dts: false,
      // Only clean node builds — serverless dirs (api/, netlify/) may contain other files
      clean: platform === "node",
      sourcemap: false,
      external: ["hono", "@hono/node-server", "tsx"],
    });

    s.stop("Build complete");

    if (platform === "vercel") {
      p.outro(
        `Output: api/index.js\nDeploy: push to GitHub and connect to Vercel`
      );
    } else if (platform === "netlify") {
      const dbType = (userConfig?.database as { type?: string } | undefined)
        ?.type;
      if (!dbType || dbType === "sqlite") {
        p.note(
          "SQLite is not supported on Netlify (ephemeral filesystem).\nSet logEntries: false or switch to a cloud database in simapi.config.ts.",
          "Warning"
        );
      }
      p.outro(
        `Output: netlify/functions/api.mjs\nDeploy: push to GitHub and connect to Netlify`
      );
    } else {
      p.outro(`Output: .simapi/dist/server.mjs\nRun with: npm run start`);
    }
  } catch (err) {
    s.stop("Build failed");
    console.error(err);
    process.exit(1);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

async function scanTsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await scanTsFiles(full)));
      } else if ([".ts", ".js"].includes(extname(entry.name))) {
        files.push(full);
      }
    }
  } catch {
    // ignore missing directories
  }
  return files;
}

function buildProductionEntry(opts: {
  configRel: string;
  authRel: string | null;
  importLines: string[];
  endpointVars: string[];
  platform: Platform;
}): string {
  const { configRel, authRel, importLines, endpointVars, platform } = opts;

  const authImport = authRel ? `import { authHandler } from "${authRel}";` : "";

  const endpointCollection =
    endpointVars.length > 0
      ? `const allMods = [${endpointVars.join(", ")}];\n` +
        `const endpoints = allMods.flatMap((m) => Object.values(m)).filter(isEndpoint);`
      : `const endpoints: EndpointDefinition[] = [];`;

  const platformImport =
    platform === "vercel"
      ? `import { handle } from "@hono/node-server/vercel";`
      : platform === "node"
        ? `import { serve } from "@hono/node-server";`
        : "";

  const platformTail =
    platform === "vercel"
      ? `export default handle(app);\nexport const config = { maxDuration: 30 };`
      : platform === "netlify"
        ? `export default (req: Request) => app.fetch(req);`
        : `const port = Number(process.env.PORT ?? config.port ?? 3000);\nserve({ fetch: app.fetch, port }, (info) => {\n  console.log(\`\\n  SimAPI running at http://localhost:\${info.port}\\n\`);\n});`;

  return `// Auto-generated by simapi build — do not edit
import { Hono } from "hono";
${platformImport}
import { z } from "zod";
import { AppRequest, AppResponse, ValidationError, ValidationErrors } from "@simapi/simapi";
import type { EndpointDefinition } from "@simapi/simapi";
import config from "${configRel}";
${authImport}
${importLines.join("\n")}

function isEndpoint(v: unknown): v is EndpointDefinition {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return typeof r.path === "string" && typeof r.method === "string" &&
    typeof r.type === "string" && typeof r.handler === "function";
}

${endpointCollection}

const app = new Hono();

app.onError((err, c) => {
  if (err instanceof ValidationError) {
    return err.format === "laravel"
      ? c.json({ message: "The given data was invalid.", errors: err.errorBag }, 422)
      : c.json({ issues: Object.entries(err.errorBag).flatMap(([f, ms]) => ms.map((m) => ({ path: [f], message: m }))) }, 422);
  }
  console.error("[SimAPI]", err);
  return c.json({ message: "Internal server error" }, 500);
});

for (const endpoint of endpoints) {
  app.on(endpoint.method, endpoint.path, async (c) => {
    const start = Date.now();
    const headers: Record<string, string> = {};
    c.req.raw.headers.forEach((v, k) => { headers[k] = v; });

    let body: Record<string, unknown> = {};
    const ct = c.req.header("content-type") ?? "";
    if (ct.includes("application/json"))
      body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
    else if (ct.includes("application/x-www-form-urlencoded")) {
      const form = await c.req.formData().catch(() => null);
      form?.forEach((v, k) => { body[k] = v; });
    }

    const query: Record<string, string> = {};
    new URL(c.req.url).searchParams.forEach((v, k) => { query[k] = v; });

    let _errors = new ValidationErrors({});
    if (endpoint.validator) {
      const _result = z.object(endpoint.validator).safeParse(body);
      if (!_result.success) {
        const _bag: Record<string, string[]> = {};
        for (const _issue of _result.error.issues) {
          const _f = String(_issue.path[0] ?? "_");
          if (!_bag[_f]) _bag[_f] = [];
          _bag[_f].push(_issue.message);
        }
        _errors = new ValidationErrors(_bag);
      }
    }

    const req = new AppRequest(headers, body, query, c.req.param() as Record<string, string>, _errors);

    if (endpoint.type === "secure") {
      ${authRel ? "const ar = config.authHandler ? config.authHandler(req) : (authHandler(req));" : "const ar = config.authHandler?.(req);"}
      if (ar instanceof AppResponse) return c.json(ar.body, ar.status as never);
    }

    if (config.autoThrowValidationErrors && endpoint.validator) {
      _errors.throwValidationError(config.autoThrowValidationErrors);
    }

    const res = await endpoint.handler(req);
    const durationMs = Date.now() - start;

    if (config.consoleLog) {
      console.log(\`[SimAPI] \${endpoint.method} \${c.req.path} → \${res.status} (\${durationMs}ms)\`);
    }

    return c.json(res.body, res.status as never);
  });
}

${platformTail}
`;
}
