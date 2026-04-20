# create-simapi

<img src="https://raw.githubusercontent.com/SimAPI/simapi/main/simapi.png" alt="SimAPI" width="120" style="display: block; margin: 10px auto; border-radius: 10px;" />

> Mock backends that behave like real ones.

**[Documentation](https://simapi.mayrlabs.com)** | **[Quickstart](#usage)** | **[Github](https://github.com/SimAPI/simapi)**

Scaffold a new [SimAPI](../simapi) project with a single command.

## Usage

```sh
npm create simapi@latest my-api
# or
npx create-simapi my-api
```

The scaffolder prompts for:
- Project name and description
- Whether to add an auth handler
- Whether to install the debug console
- Whether to include a Dockerfile

## What you get

```
my-api/
├── endpoints/
│   └── get-posts.ts
├── simapi.config.ts
├── package.json
└── tsconfig.json
```

## License

[MIT](../../LICENSE)
