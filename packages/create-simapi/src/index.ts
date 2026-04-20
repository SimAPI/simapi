import { cac } from "cac";

import { runCreate } from "./create.js";

const cli = cac("create-simapi");

cli
  .command("[name]", "Create a new SimAPI project")
  .action((name: string | undefined) => {
    runCreate(name).catch((err: unknown) => {
      console.error(err);
      process.exit(1);
    });
  });

cli.help();
cli.version("0.1.0");
cli.parse();
