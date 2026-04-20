import { type AppRequest, AppResponse, Validator } from "simapi";

export const createPost = {
  path: "/api/posts",
  method: "POST",
  type: "open",
  handler: (req: AppRequest) => {
    const errors = req.validateBody({
      title: [Validator.required(), Validator.string(), Validator.minLength(3)],
      body: [Validator.required(), Validator.string()],
    });

    if (errors.hasError) {
      errors.throwValidationError("laravel");
    }

    return AppResponse.created({
      data: {
        id: AppResponse.fake.uuid(),
        title: req.body<string>("title"),
        body: req.body<string>("body"),
        published: false,
      },
    });
  },
} as const;
