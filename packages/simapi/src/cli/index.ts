import { cac } from "cac";
import { type Platform, runBuild } from "./build.js";
import { runConsoleAdd, runConsoleRemove } from "./console.js";
import { runDev } from "./dev.js";
import { runExportOpenAPI } from "./export-openapi.js";
import { runImportOpenAPI } from "./import-openapi.js";
import { runInit } from "./init.js";
import { runInteractive } from "./interactive.js";
import { runServe } from "./serve.js";
import { runSetup } from "./setup.js";
import { runStart } from "./start.js";

declare const __SIMAPI_VERSION__: string;

const cli = cac("simapi");

cli
  .command("init [name]", "Scaffold a new SimAPI project")
  .action((name: string | undefined) => {
    runInit(name).catch(fatal);
  });

cli
  .command("serve [cwd]", "Start the dev server with live TypeScript loading")
  .action((cwd: string | undefined) => {
    runServe(cwd).catch(fatal);
  });

cli
  .command(
    "dev [cwd]",
    "Start the dev server with file watching and auto-restart"
  )
  .action((cwd: string | undefined) => {
    runDev(cwd).catch(fatal);
  });

cli.command("interactive", "Launch the interactive CLI menu").action(() => {
  runInteractive().catch(fatal);
});

cli
  .command("build [cwd]", "Compile the project to .simapi/dist/")
  .option(
    "--platform <platform>",
    "Target platform: node, vercel, netlify (default: auto-detect)"
  )
  .action((cwd: string | undefined, opts: { platform?: Platform }) => {
    runBuild(cwd, { platform: opts.platform }).catch(fatal);
  });

cli
  .command("start [cwd]", "Run the compiled production server")
  .action((cwd: string | undefined) => {
    runStart(cwd);
  });

cli
  .command(
    "setup <platform>",
    "Generate deployment config for a platform (vercel, netlify)"
  )
  .action((platform: string) => {
    runSetup(platform).catch(fatal);
  });

cli
  .command("console:add [cwd]", "Install the @simapi/console debugging UI")
  .action((cwd: string | undefined) => {
    runConsoleAdd(cwd).catch(fatal);
  });

cli
  .command("console:remove [cwd]", "Remove the @simapi/console debugging UI")
  .action((cwd: string | undefined) => {
    runConsoleRemove(cwd).catch(fatal);
  });

cli
  .command("import <spec>", "Generate endpoint stubs from an OpenAPI 3 spec")
  .option("-o, --output <dir>", "Output directory (default: endpoints/)")
  .action((spec: string, opts: { output?: string }) => {
    runImportOpenAPI(spec, undefined, opts).catch(fatal);
  });

cli
  .command("export [cwd]", "Export endpoints as an OpenAPI 3 spec")
  .option("-o, --output <file>", "Output file (default: openapi.yaml)")
  .option("--format <fmt>", "Output format: yaml or json (default: yaml)")
  .action(
    (
      cwd: string | undefined,
      opts: { output?: string; format?: "yaml" | "json" }
    ) => {
      runExportOpenAPI(cwd, opts).catch(fatal);
    }
  );

cli.help();
cli.version(__SIMAPI_VERSION__);
cli.parse();

function fatal(err: unknown): never {
  console.error(err);
  process.exit(1);
}
