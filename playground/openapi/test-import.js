import { resolve } from "node:path";
import { runImportOpenAPI } from "../../packages/openapi/dist/index.mjs";

/**
 * Quick playground script to test the importer manually.
 * Run with: node test-import.js
 */
async function test() {
  const specPath = resolve("./fixtures/petstore.json");
  const outputDir = resolve("./output");

  console.log(`🚀 Importing ${specPath} to ${outputDir}...`);

  try {
    await runImportOpenAPI(specPath, undefined, { output: outputDir });
    console.log("✅ Import successful!");
  } catch (err) {
    console.error("❌ Import failed:", err);
  }
}

test();
