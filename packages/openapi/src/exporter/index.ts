import { existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import consola from "consola";
import { stringify as yamlStringify } from "yaml";
import type { ExportOptions } from "../types.js";

/**
 * Runs the OpenAPI export using SimAPI's server internals.
 *
 * This is intentionally a thin wrapper that dynamically imports `@simapi/simapi`
 * at call time — so `@simapi/openapi` doesn't hard-couple to it at build time.
 */
export async function runExportOpenAPI(
  cwd?: string,
  opts: ExportOptions = {}
): Promise<void> {
  const root = resolve(cwd ?? process.cwd());
  const configPath = join(root, "simapi.config.ts");

  // Dynamically resolve simapi internals to avoid bundling them here.
  let discoverEndpoints: (dir: string) => Promise<unknown[]>;
  let buildOpenApiSpec: (
    endpoints: unknown[],
    config: { name?: string; description?: string }
  ) => Promise<Record<string, unknown>>;

  try {
    const { tsImport } = await import("tsx/esm/api");

    // Resolve the simapi package relative to cwd so we pick up the user's copy.
    const simapiPath = join(root, "node_modules/@simapi/simapi/dist/index.mjs");

    if (!existsSync(simapiPath)) {
      consola.error(
        "[SimAPI] Cannot find @simapi/simapi in node_modules. Is it installed?"
      );
      process.exit(1);
    }

    const simapiMod = await import(simapiPath);
    discoverEndpoints = simapiMod.discoverEndpoints;
    buildOpenApiSpec = simapiMod.buildOpenApiSpec;

    if (!discoverEndpoints || !buildOpenApiSpec) {
      throw new Error(
        "discoverEndpoints or buildOpenApiSpec not exported by @simapi/simapi"
      );
    }

    // Load the user's config if present.
    let config: { name?: string; description?: string; endpointsDir?: string } =
      {};
    if (existsSync(configPath)) {
      try {
        const mod = await tsImport(configPath, {
          parentURL: import.meta.url,
        });
        config = (mod.default ?? mod) as typeof config;
      } catch {
        // Proceed with defaults if config can't be loaded.
      }
    }

    const endpointsDir = resolve(root, config.endpointsDir ?? "endpoints");

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
      name: config.name ?? "SimAPI",
      description: config.description,
    });

    const outputArg = opts.output ?? "openapi.yaml";
    const format =
      opts.format ?? (outputArg.endsWith(".json") ? "json" : "yaml");
    const outPath = resolve(root, outputArg);

    const content =
      format === "json"
        ? JSON.stringify(spec, null, 2)
        : yamlStringify(spec, { lineWidth: 120 });

    writeFileSync(outPath, content, "utf8");
    consola.success(
      `[SimAPI] Exported ${endpoints.length} endpoint(s) → ${outPath}`
    );
  } catch (err) {
    consola.error("[SimAPI] Export failed:", err);
    process.exit(1);
  }
}
