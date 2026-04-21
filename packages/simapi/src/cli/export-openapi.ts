import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tsImport } from "tsx/esm/api";
import { stringify as yamlStringify } from "yaml";

import type { SimAPIConfig } from "../core/defineConfig.js";
import type { EndpointDefinition } from "../core/endpoint.js";
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
    console.error(`[SimAPI] Endpoints directory not found: ${endpointsDir}`);
    process.exit(1);
  }

  const files = readdirSync(endpointsDir, { recursive: false })
    .filter((f): f is string => typeof f === "string")
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

  const endpoints: EndpointDefinition[] = [];

  for (const file of files) {
    try {
      const mod = await tsImport(join(endpointsDir, file), {
        parentURL: import.meta.url,
      });
      for (const key of Object.keys(mod)) {
        const val = mod[key];
        if (
          val &&
          typeof val === "object" &&
          "path" in val &&
          "method" in val &&
          "type" in val
        ) {
          endpoints.push(val as EndpointDefinition);
        }
      }
    } catch (err) {
      console.warn(`[SimAPI] Skipping ${file}:`, err);
    }
  }

  if (endpoints.length === 0) {
    console.error("[SimAPI] No endpoints found.");
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
  console.log(`[SimAPI] Exported ${endpoints.length} endpoint(s) → ${outPath}`);
}
