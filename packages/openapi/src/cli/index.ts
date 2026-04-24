import { cac } from "cac";
import consola from "consola";
import { runExportOpenAPI } from "../exporter/index.js";
import { runImportOpenAPI } from "../importer/index.js";

const cli = cac("simapi-openapi");

cli
  .command("import <spec>", "Import an OpenAPI specification")
  .option("-o, --output <dir>", "Output directory for generated files")
  .action(async (spec, options) => {
    try {
      await runImportOpenAPI(spec, process.cwd(), {
        output: options.output,
      });
    } catch (err) {
      consola.error("Import failed:", err);
      process.exit(1);
    }
  });

cli
  .command("export", "Export endpoints to an OpenAPI specification")
  .option("-o, --output <file>", "Output file path (YAML or JSON)")
  .option("--format <fmt>", "Output format: yaml or json")
  .action(async (options) => {
    try {
      await runExportOpenAPI(process.cwd(), {
        output: options.output,
        format: options.format,
      });
    } catch (err) {
      consola.error("Export failed:", err);
      process.exit(1);
    }
  });

cli.help();
cli.version("0.0.10");

cli.parse();
