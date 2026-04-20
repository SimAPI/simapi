import { type AppRequest, AppResponse, faker, z } from "simapi";

export const createPost = {
  path: "/api/posts",
  method: "POST",
  type: "open",
  validator: {
    title: z.string().min(3),
    body: z.string(),
  },
  handler: (req: AppRequest) => {
    req.errors.throwValidationError("laravel");

    return AppResponse.created({
      data: {
        id: faker.string.ulid(),
        title: req.body<string>("title"),
        body: req.body<string>("body"),
        published: false,
      },
    });
  },
} as const;
