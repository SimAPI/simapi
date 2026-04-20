import { type AppRequest, AppResponse, faker } from "simapi";

export const getPost = {
  path: "/api/posts/:id",
  method: "GET",
  type: "open",
  handler: (req: AppRequest) => {
    const id = req.urlParam("id");
    return AppResponse.success({
      data: {
        id,
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        published: true,
      },
    });
  },
} as const;
