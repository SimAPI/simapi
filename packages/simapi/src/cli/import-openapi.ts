/**
 * CLI shim — delegates to `@simapi/openapi`.
 * The existing `simapi import` command calls `runImportOpenAPI` directly,
 * so we re-export it unchanged for backward compatibility.
 */
export { runImportOpenAPI } from "@simapi/openapi";
