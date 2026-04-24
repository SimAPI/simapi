/**
 * CLI shim — delegates to `@simapi/openapi`.
 * The existing `simapi export` command calls `runExportOpenAPI` directly,
 * so we re-export it unchanged for backward compatibility.
 */
export { runExportOpenAPI } from "@simapi/openapi";
