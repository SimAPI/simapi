import { type AppRequest, AppResponse } from "simapi";

export const deletePost = {
  path: "/api/posts/:id",
  method: "DELETE",
  type: "secure",
  handler: (req: AppRequest) => {
    const id = req.urlParam("id");
    return AppResponse.success({ message: `Post ${id} deleted` });
  },
} as const;
