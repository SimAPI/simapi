import { existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import consola from "consola";
import { tsImport } from "tsx/esm/api";
import { stringify as yamlStringify } from "yaml";
import type { SimAPIConfig } from "../core/defineConfig.js";
import { discoverEndpoints } from "../server/discovery.js";
import { buildOpenApiSpec } from "../server/openapi.js";

export async function runExportOpenAPI(
  cwd?: string,
  opts: { output?: string; format?: "yaml" | "json" } = {}
): Promise<void> {
  const root = resolve(cwd ?? process.cwd());
  const configPath = join(root, "simapi.config.ts");

  let config: SimAPIConfig | undefined;
  if (existsSync(configPath)) {
    try {
      const mod = await tsImport(configPath, { parentURL: import.meta.url });
      config = (mod.default ?? mod) as SimAPIConfig;
    } catch {
      // proceed with defaults
    }
  }

  const endpointsDir = resolve(root, config?.endpointsDir ?? "endpoints");
  if (!existsSync(endpointsDir)) {
    consola.error(`[SimAPI] Endpoints directory not found: ${endpointsDir}`);
    process.exit(1);
  }

  const endpoints = await discoverEndpoints(endpointsDir);

  if (endpoints.length === 0) {
    consola.error("[SimAPI] No endpoints found.");
    return;
  }

  const spec = await buildOpenApiSpec(endpoints, {
    name: config?.name ?? "SimAPI",
    description: config?.description,
  });

  const outputArg = opts.output ?? "openapi.yaml";
  const format = opts.format ?? (outputArg.endsWith(".json") ? "json" : "yaml");
  const outPath = resolve(root, outputArg);

  const content =
    format === "json"
      ? JSON.stringify(spec, null, 2)
      : yamlStringify(spec, { lineWidth: 120 });

  writeFileSync(outPath, content, "utf8");
  consola.log(`[SimAPI] Exported ${endpoints.length} endpoint(s) → ${outPath}`);
}
