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

export async function runInit(name: string | undefined): Promise<void> {
  p.intro("SimAPI — new project");

  const projectName =
    name ??
    (await p.text({
      message: "Project name",
      placeholder: "my-server",
      validate: (v) => (v.trim() ? undefined : "Name is required"),
    }));

  if (p.isCancel(projectName)) {
    cancelled();
    return;
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

  const dir = resolve(process.cwd(), projectName as string);
  const vars = {
    name: projectName as string,
    description: (description as string) || "",
  };

  const s = p.spinner();
  s.start("Scaffolding project");

  await mkdir(join(dir, "endpoints"), { recursive: true });

  await Promise.all([
    writeFile(join(dir, "package.json"), fill(PACKAGE_JSON, vars)),
    writeFile(join(dir, "tsconfig.json"), TSCONFIG_JSON),
    writeFile(join(dir, ".gitignore"), GITIGNORE),
    writeFile(
      join(dir, "simapi.config.ts"),
      fill(withAuth ? SIMAPI_CONFIG_WITH_AUTH_TS : SIMAPI_CONFIG_TS, vars)
    ),
    writeFile(join(dir, "endpoints", ".gitkeep"), ""),
    withAuth
      ? writeFile(join(dir, "authHandler.ts"), AUTH_HANDLER_TS)
      : Promise.resolve(),
    withDockerfile
      ? writeFile(join(dir, "Dockerfile"), DOCKERFILE)
      : Promise.resolve(),
  ]);

  // Patch package.json to add @simapi/console if opted in
  if (withConsole) {
    const pkgPath = join(dir, "package.json");
    const pkg = JSON.parse(fill(PACKAGE_JSON, vars)) as {
      dependencies: Record<string, string>;
    };
    pkg.dependencies["@simapi/console"] = "^0.1.0";
    await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  }

  s.stop("Project scaffolded");

  p.note(
    `cd ${projectName as string}\nnpm install\nnpm run serve`,
    "Next steps"
  );

  p.outro("Happy mocking!");
}
