import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import * as p from "@clack/prompts";

import {
  AUTH_HANDLER_TS,
  DOCKERFILE,
  fill,
  GITIGNORE,
  PACKAGE_JSON,
  SIMAPI_CONFIG_TS,
  SIMAPI_CONFIG_WITH_AUTH_TS,
  TSCONFIG_JSON,
} from "./templates.js";

function cancelled(): void {
  p.cancel("Cancelled.");
}

export async function runCreate(name: string | undefined): Promise<void> {
  p.intro("create-simapi");

  const projectName =
    name ??
    (await p.text({
      message: "Project name",
      placeholder: "my-api",
      validate: (v) => (v.trim() ? undefined : "Name is required"),
    }));

  if (p.isCancel(projectName)) {
    cancelled();
    return;
  }

  const targetDir = resolve(process.cwd(), projectName as string);
  if (existsSync(targetDir)) {
    const overwrite = await p.confirm({
      message: `Directory "${projectName as string}" already exists. Continue anyway?`,
      initialValue: false,
    });
    if (p.isCancel(overwrite) || !overwrite) {
      cancelled();
      return;
    }
  }

  const description = await p.text({
    message: "Description",
    placeholder: "Mock backend for my app",
    defaultValue: "",
  });
  if (p.isCancel(description)) {
    cancelled();
    return;
  }

  const withAuth = await p.confirm({
    message: "Include an auth handler?",
    initialValue: false,
  });
  if (p.isCancel(withAuth)) {
    cancelled();
    return;
  }

  const withConsole = await p.confirm({
    message: "Include the debugging console (@simapi/console)?",
    initialValue: true,
  });
  if (p.isCancel(withConsole)) {
    cancelled();
    return;
  }

  const withDockerfile = await p.confirm({
    message: "Include a Dockerfile?",
    initialValue: false,
  });
  if (p.isCancel(withDockerfile)) {
    cancelled();
    return;
  }

  const vars = {
    name: projectName as string,
    description: (description as string) || "",
  };

  const s = p.spinner();
  s.start("Scaffolding project");

  await mkdir(join(targetDir, "endpoints"), { recursive: true });

  let pkgJson = fill(PACKAGE_JSON, vars);
  if (withConsole) {
    const pkg = JSON.parse(pkgJson) as {
      dependencies: Record<string, string>;
    };
    pkg.dependencies["@simapi/console"] = "^0.1.0";
    pkgJson = `${JSON.stringify(pkg, null, 2)}\n`;
  }

  await Promise.all([
    writeFile(join(targetDir, "package.json"), pkgJson),
    writeFile(join(targetDir, "tsconfig.json"), TSCONFIG_JSON),
    writeFile(join(targetDir, ".gitignore"), GITIGNORE),
    writeFile(
      join(targetDir, "simapi.config.ts"),
      fill(withAuth ? SIMAPI_CONFIG_WITH_AUTH_TS : SIMAPI_CONFIG_TS, vars)
    ),
    writeFile(join(targetDir, "endpoints", ".gitkeep"), ""),
    withAuth
      ? writeFile(join(targetDir, "authHandler.ts"), AUTH_HANDLER_TS)
      : Promise.resolve(),
    withDockerfile
      ? writeFile(join(targetDir, "Dockerfile"), DOCKERFILE)
      : Promise.resolve(),
  ]);

  s.stop("Project scaffolded");

  const installSpinner = p.spinner();
  installSpinner.start("Installing dependencies");
  try {
    execFileSync("npm", ["install"], { cwd: targetDir, stdio: "ignore" });
    installSpinner.stop("Dependencies installed");
  } catch {
    installSpinner.stop("Could not install — run npm install manually");
  }

  p.note(`cd ${projectName as string}\nnpm run serve`, "Next steps");

  p.outro("Happy mocking!");
}
