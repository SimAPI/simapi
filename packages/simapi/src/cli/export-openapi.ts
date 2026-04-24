import { runExportOpenAPI } from "@simapi/openapi";

/**
 * CLI shim — delegates to the `@simapi/openapi` package.
 * Kept here so the existing `simapi export` command continues to work
 * without any user-facing changes.
 */
export async function runExportOpenAPI(
  cwd?: string,
  opts: { output?: string; format?: "yaml" | "json" } = {}
): Promise<void> {
  return runExportOpenAPI(cwd, opts);
}
