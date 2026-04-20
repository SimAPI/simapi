import { runServe } from "./serve.js";

const [, , command, ...args] = process.argv;

switch (command) {
  case "serve":
    runServe(args[0]).catch((err: unknown) => {
      console.error(err);
      process.exit(1);
    });
    break;

  default:
    console.error(`[SimAPI] Unknown command: ${command ?? "(none)"}`);
    console.error("Available commands: serve");
    process.exit(1);
}
