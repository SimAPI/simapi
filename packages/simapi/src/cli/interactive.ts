import { readdirSync } from "node:fs";
import * as p from "@clack/prompts";

import { runConsoleAdd, runConsoleRemove } from "./console.js";
import { runExportOpenAPI } from "./export-openapi.js";
import { runImportOpenAPI } from "./import-openapi.js";
import { runSetup } from "./setup.js";

export async function runInteractive(
  cwd: string = process.cwd()
): Promise<void> {
  p.intro("SimAPI — interactive");

  const action = await p.select({
    message: "What would you like to do?",
    options: [
      { value: "setup", label: "Setup", hint: "configure deployment platform" },
      { value: "console", label: "Console", hint: "manage debug UI" },
      {
        value: "import",
        label: "Import",
        hint: "generate endpoints from OpenAPI spec",
      },
      {
        value: "export",
        label: "Export",
        hint: "export endpoints as OpenAPI spec",
      },
    ],
  });

  if (p.isCancel(action)) {
    p.cancel("Cancelled.");
    return;
  }

  if (action === "setup") {
    const platform = await p.select({
      message: "Select platform",
      options: [
        { value: "docker", label: "Docker" },
        { value: "vercel", label: "Vercel" },
        { value: "netlify", label: "Netlify" },
      ],
    });

    if (p.isCancel(platform)) {
      p.cancel("Cancelled.");
      return;
    }

    await runSetup(platform as string, cwd);
  } else if (action === "console") {
    const sub = await p.select({
      message: "Console action",
      options: [
        { value: "add", label: "Add", hint: "install @simapi/console" },
        { value: "remove", label: "Remove", hint: "uninstall @simapi/console" },
      ],
    });

    if (p.isCancel(sub)) {
      p.cancel("Cancelled.");
      return;
    }

    if (sub === "add") await runConsoleAdd(cwd);
    else await runConsoleRemove(cwd);
  } else if (action === "import") {
    const files = readdirSync(cwd).filter((f) =>
      [".yaml", ".yml", ".json"].some((ext) => f.endsWith(ext))
    );

    let spec: string | symbol = "";

    if (files.length > 0) {
      const selected = await p.select({
        message: "Select OpenAPI spec file",
        options: [
          ...files.map((f) => ({ value: f, label: f })),
          { value: "other", label: "Other (enter path...)" },
        ],
      });

      if (p.isCancel(selected)) {
        p.cancel("Cancelled.");
        return;
      }

      if (selected === "other") {
        spec = await p.text({
          message: "Path to OpenAPI spec file",
          placeholder: "openapi.yaml",
          validate: (v) => (v.trim() ? undefined : "Spec path is required"),
        });
      } else {
        spec = selected as string;
      }
    } else {
      spec = await p.text({
        message: "Path to OpenAPI spec file",
        placeholder: "openapi.yaml",
        validate: (v) => (v.trim() ? undefined : "Spec path is required"),
      });
    }

    if (p.isCancel(spec)) {
      p.cancel("Cancelled.");
      return;
    }

    const outputDir = await p.text({
      message: "Output directory",
      placeholder: "src/endpoints/",
      defaultValue: "src/endpoints/",
    });

    if (p.isCancel(outputDir)) {
      p.cancel("Cancelled.");
      return;
    }

    await runImportOpenAPI(spec as string, cwd, {
      output: (outputDir as string) || "src/endpoints/",
    });
  } else if (action === "export") {
    const outputFile = await p.text({
      message: "Output file",
      placeholder: "openapi.yaml",
      defaultValue: "openapi.yaml",
    });

    if (p.isCancel(outputFile)) {
      p.cancel("Cancelled.");
      return;
    }

    const format = await p.select({
      message: "Output format",
      options: [
        { value: "yaml", label: "YAML" },
        { value: "json", label: "JSON" },
      ],
    });

    if (p.isCancel(format)) {
      p.cancel("Cancelled.");
      return;
    }

    await runExportOpenAPI(cwd, {
      output: (outputFile as string) || "openapi.yaml",
      format: format as "yaml" | "json",
    });
  }
}
