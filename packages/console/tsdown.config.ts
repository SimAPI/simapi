import { defineConfig } from "tsdown";

export default defineConfig({
  entry: { index: "mount/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  clean: false,
  deps: { neverBundle: ["hono", "@hono/node-server"] },
});
