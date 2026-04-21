# Getting Started

## Quickstart

The fastest way to start a SimAPI project:

```sh
npx @simapi/simapi@latest init my-api
cd my-api
npm run serve
```

Your mock server is running at **http://localhost:3000**.

## Manual setup

Install SimAPI into an existing project:

```sh
npm install @simapi/simapi
npx @simapi/simapi@latest init
```

## Project structure

A well-organized SimAPI project groups endpoints by resource and defines reusable data factories in a `models/` directory:

```
my-api/
├── endpoints/          # Grouped by resource — every named export is auto-discovered
│   ├── posts.ts        # listPosts, getPost, createPost, …
│   ├── users.ts        # listUsers, getUser, createUser, …
│   └── comments.ts     # listComments, createComment, …
├── models/             # Shared data factories — keeps endpoints DRY
│   ├── post.ts         # Post interface + makePost() factory
│   └── user.ts         # User interface + makeUser() factory
├── simapi.config.ts
└── package.json
```

You can put as many endpoints as you like in one file. SimAPI discovers every named export from every `.ts` file inside `endpoints/` automatically — no registration required.

## Defining models

A model file exports a TypeScript interface and a factory function that generates realistic fake data:

```ts
// models/post.ts
import { faker } from "@simapi/simapi";

export interface Post {
  id: string;
  title: string;
  body: string;
  published: boolean;
  author: string;
}

export function makePost(): Post {
  return {
    id: faker.string.ulid(),
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(2),
    published: faker.datatype.boolean(),
    author: faker.person.fullName(),
  };
}
```

## Grouping endpoints

Multiple endpoints can live in a single file. Importing from your model keeps the handler clean:

```ts
// endpoints/posts.ts
import { z, AppResponse, type EndpointDefinition } from "@simapi/simapi";
import { makePost } from "../models/post.js";

export const listPosts: EndpointDefinition = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  handler: () =>
    AppResponse.success({ data: AppResponse.array(10, makePost) }),
};

export const getPost: EndpointDefinition = {
  path: "/api/posts/:id",
  method: "GET",
  type: "open",
  handler: () => AppResponse.success({ data: makePost() }),
};

export const createPost: EndpointDefinition = {
  path: "/api/posts",
  method: "POST",
  type: "secure",
  validator: {
    title: z.string().min(3),
    body: z.string().min(10),
  },
  handler: (req) => {
    req.errors.throwValidationError();
    return AppResponse.created({ data: makePost() });
  },
};
```

## Development workflow

```sh
npm run serve    # Start dev server with live reload
npm run build    # Compile to .simapi/dist/ for deployment
npm run start    # Run the compiled production server
```

## Demo project

A complete example with posts, users, and comments is available in the
[SimAPI repository](https://github.com/SimAPI/simapi/tree/main/examples).

## Adding the console

Install the optional request inspector:

```sh
npx simapi console:add
```

Browse to **http://localhost:3000/__simapi/console/** to inspect live requests, view your schema, and fire test requests interactively.
