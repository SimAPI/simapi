# Contributing to @simapi/simapi

Thank you for your interest in contributing. All types of contributions are welcome — bug reports, feature requests, documentation improvements, and code changes.

## Prerequisites

- **Node.js** >= 20
- **npm** >= 11 (ships with Node.js 22+)
- Familiarity with TypeScript

## Local setup

```sh
# 1. Fork and clone the repo
git clone https://github.com/SimAPI/simapi.git
cd simapi

# 2. Install all workspace dependencies
npm install

# 3. Build all packages
npm run build
```

## Development workflow

All commands below are run from the **monorepo root** unless noted otherwise.

| Command               | What it does                       |
| --------------------- | ---------------------------------- |
| `npm run build`       | Build every package (Turborepo)    |
| `npm run dev`         | Watch-mode build for all packages  |
| `npm run test`        | Run the full test suite (Vitest)   |
| `npm run check-types` | TypeScript type-check all packages |
| `npm run lint`        | Lint with Biome                    |
| `npm run lint:fix`    | Lint and auto-fix                  |
| `npm run format`      | Format all files with Biome        |

To work only on this package:

```sh
cd packages/simapi
npm run build        # one-off build
npm run dev          # watch mode
npm run test         # unit tests
npm run check-types  # type-check
```

## Project structure

```
packages/simapi/
├── src/
│   ├── index.ts          # Public API exports
│   ├── cli/              # CLI commands (serve, build, init, import, export …)
│   ├── core/             # AppRequest, AppResponse, EndpointDefinition, auth …
│   ├── server/           # Hono app factory, endpoint discovery, OpenAPI gen
│   └── db/               # Database adapters (SQLite, libSQL, Postgres)
├── bin/
│   └── simapi.js         # CLI entry point — thin wrapper around dist/cli.mjs
├── tsdown.config.ts      # Build config (dual ESM/CJS library + ESM CLI bundle)
└── package.json
```

## Making changes

### Bug fix or small improvement

1. Create a branch: `git checkout -b fix/describe-the-fix`
2. Make your changes in `src/`
3. Add or update tests in `src/__tests__/` where relevant
4. Run `npm run test` and `npm run check-types` from the root — both must pass
5. Open a pull request against `main`

### New feature

Before writing code, open an issue describing what you want to add and why. This avoids wasted effort if the feature doesn't fit the project's direction.

### CLI changes

CLI commands live in `src/cli/`. The entry point is `src/cli/index.ts` (parsed by [cac](https://github.com/cacjs/cac)). Interactive prompts use [@clack/prompts](https://github.com/bombshell-dev/clack).

The CLI is bundled separately from the library by `tsdown` — `bin/simapi.js` dynamically imports `dist/cli.mjs` at runtime.

### Adding a new AuthHandler

Built-in handlers are in `src/core/AuthHandlers.ts`. Each factory returns an `AuthHandler` function. Follow the existing pattern and export the new factory from the same file.

## Code style

This project uses [Biome](https://biomejs.dev) for linting and formatting. Run `npm run format` before committing — the pre-commit hook will also enforce this via `lint-staged`.

No comments that describe *what* the code does. A short comment is acceptable only when the *why* is non-obvious.

## Versioning

This monorepo uses [Changesets](https://github.com/changesets/changesets). If your change warrants a version bump (bug fix, new feature, breaking change), add a changeset:

```sh
npx changeset
```

Follow the prompts to describe the change and pick the bump type (`patch`, `minor`, `major`). Commit the generated file alongside your code changes.

> You do not need to edit `CHANGELOG.md` manually — it is updated automatically during the release process.

## Reporting issues

Use the [GitHub issue tracker](https://github.com/SimAPI/simapi/issues). Include:

- Node.js version (`node --version`)
- Package version
- A minimal reproduction (a few lines of config + endpoint is usually enough)
- What you expected vs. what actually happened

## Code of Conduct

Be respectful and constructive. Contributions of all experience levels are welcome.
