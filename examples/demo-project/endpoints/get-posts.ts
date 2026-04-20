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
        body: AppResponse.fake.string(20),
        published: AppResponse.fake.boolean(),
      })),
      meta: { total: 5, page: 1, perPage: 20 },
    });
  },
} as const;
