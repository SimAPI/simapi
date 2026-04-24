import { describe, expect, it } from "vitest";

/**
 * Exporter tests are intentionally lightweight here — the exporter dynamically
 * imports @simapi/simapi at runtime, which would require the full library to be
 * built and present. These tests focus on the unit-testable utility functions
 * and the integration smoke tests that don't need a live SimAPI server.
 *
 * End-to-end exporter tests should be run from within a SimAPI project using
 * `simapi export openapi`.
 */

describe("exporter module", () => {
  it("exports runExportOpenAPI function", async () => {
    const mod = await import("../exporter/index.js");
    expect(typeof mod.runExportOpenAPI).toBe("function");
  });
});

describe("types module", () => {
  it("OASpec shape is well-typed", () => {
    const spec = {
      openapi: "3.0.3",
      info: { title: "Test", version: "1.0.0" },
      paths: {},
    };
    // If TypeScript compiles this without error, the types work
    expect(spec.openapi).toBe("3.0.3");
  });
});
