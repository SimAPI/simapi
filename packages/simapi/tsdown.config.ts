import { readFileSync } from "node:fs";
import { defineConfig } from "tsdown";

const { version } = JSON.parse(readFileSync("./package.json", "utf8")) as {
  version: string;
};
const define = { __SIMAPI_VERSION__: JSON.stringify(version) };

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
    define,
  },
  {
    entry: { cli: "src/cli/index.ts" },
    format: ["esm"],
    dts: false,
    sourcemap: false,
    deps: { neverBundle: ["@simapi/console"] },
    define,
  },
]);
