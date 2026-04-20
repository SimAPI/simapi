# Getting Started

## Quickstart

The fastest way to start a SimAPI project:

```sh
npm create simapi@latest my-api
cd my-api
npm run serve
```

Your mock server is running at **http://localhost:3000**.

## Manual setup

If you prefer to set up manually, install SimAPI into an existing project:

```sh
npm install simapi
```

Then run the interactive scaffolder:

```sh
npx simapi init
```

## Project structure

A scaffolded project looks like this:

```
my-api/
├── endpoints/          # One file per endpoint (auto-discovered)
│   └── get-posts.ts
├── simapi.config.ts    # Server configuration
├── authHandler.ts      # Optional — handles Authorization checks
├── package.json
└── tsconfig.json
```

## Creating an endpoint

Use the interactive scaffolder:

```sh
npm run endpoint:create
```

Or write one by hand:

```ts
// endpoints/get-posts.ts
import { AppResponse } from "simapi";

export const getPosts = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  handler: () => {
    return AppResponse.success({
      data: AppResponse.fake.array(5, () => ({
        id: AppResponse.fake.uuid(),
        title: AppResponse.fake.string(6),
      })),
    });
  },
} as const;
```

## Development workflow

```sh
# Start the dev server (live reload)
npm run serve

# Compile for deployment
npm run build

# Run the compiled server
npm run start
```

## Adding the console

Install the optional debugging UI:

```sh
npx simapi console:add
```

Browse to **http://localhost:3000/__simapi/console/** to inspect requests, view your schema, and test endpoints interactively.
