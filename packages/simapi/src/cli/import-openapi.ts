import { runImportOpenAPI as originalRunImportOpenAPI } from "@simapi/openapi";

/**
 * CLI shim — delegates to `@simapi/openapi`.
 *
 * To preserve backward compatibility with `simapi import --output src/endpoints/`,
 * we detect if the output ends in `/endpoints` and strip it. The new importer
 * creates its own `endpoints/`, `requests/`, and `models/` subdirectories.
 */
export async function runImportOpenAPI(
  spec: string,
  cwd?: string,
  opts: { output?: string } = {}
) {
  let output = opts.output;
  if (
    output &&
    (output.endsWith("/endpoints") || output.endsWith("/endpoints/"))
  ) {
    output = output.replace(/\/endpoints\/?$/, "");
  }
  return originalRunImportOpenAPI(spec, cwd, { ...opts, output });
}
