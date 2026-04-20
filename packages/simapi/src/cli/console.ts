import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import * as p from "@clack/prompts";

export async function runConsoleAdd(
  cwd: string = process.cwd()
): Promise<void> {
  p.intro("SimAPI — add console");

  const pkgPath = resolve(cwd, "package.json");
  if (!existsSync(pkgPath)) {
    p.cancel("No package.json found. Run this command from your project root.");
    process.exit(1);
  }

  const s = p.spinner();
  s.start("Installing @simapi/console");

  try {
    execFileSync("npm", ["install", "@simapi/console"], {
      cwd,
      stdio: "pipe",
    });
    s.stop("@simapi/console installed");
    p.outro(
      "Console enabled. Start your server and visit http://localhost:3000/console"
    );
  } catch (err) {
    s.stop("Installation failed");
    console.error(err);
    process.exit(1);
  }
}

export async function runConsoleRemove(
  cwd: string = process.cwd()
): Promise<void> {
  p.intro("SimAPI — remove console");

  const pkgPath = resolve(cwd, "package.json");
  if (!existsSync(pkgPath)) {
    p.cancel("No package.json found. Run this command from your project root.");
    process.exit(1);
  }

  // Check if @simapi/console is listed before trying to remove
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
    dependencies?: Record<string, string>;
  };
  if (!pkg.dependencies?.["@simapi/console"]) {
    p.outro("@simapi/console is not installed — nothing to remove.");
    return;
  }

  const s = p.spinner();
  s.start("Removing @simapi/console");

  try {
    execFileSync("npm", ["uninstall", "@simapi/console"], {
      cwd,
      stdio: "pipe",
    });

    // Remove the key from package.json in case npm didn't clean it up
    const updatedPkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
      dependencies?: Record<string, string>;
    };
    if (updatedPkg.dependencies?.["@simapi/console"]) {
      delete updatedPkg.dependencies["@simapi/console"];
      writeFileSync(pkgPath, `${JSON.stringify(updatedPkg, null, 2)}\n`);
    }

    s.stop("@simapi/console removed");
    p.outro("Console disabled.");
  } catch (err) {
    s.stop("Removal failed");
    console.error(err);
    process.exit(1);
  }
}
