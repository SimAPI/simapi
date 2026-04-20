import { type AppRequest, AppResponse } from "simapi";

export const getPost = {
  path: "/api/posts/:id",
  method: "GET",
  type: "open",
  handler: (req: AppRequest) => {
    const id = req.urlParam("id");
    return AppResponse.success({
      data: {
        id,
        title: AppResponse.fake.string(6),
        body: AppResponse.fake.string(20),
        published: true,
      },
    });
  },
} as const;
