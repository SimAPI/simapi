import { cac } from "cac";
import { runBuild } from "./build.js";
import { runConsoleAdd, runConsoleRemove } from "./console.js";
import { runExportOpenAPI } from "./export-openapi.js";
import { runImportOpenAPI } from "./import-openapi.js";
import { runInit } from "./init.js";
import { runServe } from "./serve.js";
import { runStart } from "./start.js";

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
  .command("build [cwd]", "Compile the project to .simapi/dist/")
  .action((cwd: string | undefined) => {
    runBuild(cwd).catch(fatal);
  });

cli
  .command("start [cwd]", "Run the compiled production server")
  .action((cwd: string | undefined) => {
    runStart(cwd);
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
cli.version("0.1.0");
cli.parse();

function fatal(err: unknown): never {
  console.error(err);
  process.exit(1);
}
