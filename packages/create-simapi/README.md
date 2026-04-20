# create-simapi

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
