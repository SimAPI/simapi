import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import * as p from "@clack/prompts";

import { NETLIFY_TOML, VERCEL_JSON } from "./templates.js";

const SUPPORTED_PLATFORMS = ["vercel", "netlify"] as const;
type SetupPlatform = (typeof SUPPORTED_PLATFORMS)[number];

export async function runSetup(
  platform: string | undefined,
  cwd: string = process.cwd()
): Promise<void> {
  p.intro("SimAPI — setup");

  if (!platform) {
    p.cancel(
      `Specify a platform: simapi setup vercel  |  simapi setup netlify`
    );
    process.exit(1);
  }

  if (!SUPPORTED_PLATFORMS.includes(platform as SetupPlatform)) {
    p.cancel(
      `Unknown platform "${platform}". Supported: ${SUPPORTED_PLATFORMS.join(", ")}`
    );
    process.exit(1);
  }

  const target = platform as SetupPlatform;

  if (target === "vercel") {
    await writeConfig(cwd, "vercel.json", VERCEL_JSON);
    p.note(
      [
        "1. Push your project to GitHub",
        "2. Import the repo at vercel.com → New Project",
        "3. Framework Preset: Other",
        "4. Build Command: npm run build",
        "5. Leave Start Command blank",
        "",
        "SimAPI auto-detects Vercel's build environment and outputs api/index.mjs.",
      ].join("\n"),
      "Next steps"
    );
    p.outro("vercel.json created.");
  } else {
    await writeConfig(cwd, "netlify.toml", NETLIFY_TOML);
    p.note(
      [
        "1. Push your project to GitHub",
        "2. Import the repo at netlify.com → Add new site",
        "3. Netlify detects netlify.toml automatically",
        "4. Add env vars under Site settings → Environment variables",
        "",
        "SimAPI auto-detects Netlify's build environment and outputs netlify/functions/api.mjs.",
      ].join("\n"),
      "Next steps"
    );
    p.outro("netlify.toml created.");
  }
}

async function writeConfig(
  cwd: string,
  filename: string,
  content: string
): Promise<void> {
  const dest = resolve(cwd, filename);

  if (existsSync(dest)) {
    const overwrite = await p.confirm({
      message: `${filename} already exists. Overwrite?`,
      initialValue: false,
    });
    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
  }

  await writeFile(dest, content);
  p.log.success(`Created ${filename}`);
}
