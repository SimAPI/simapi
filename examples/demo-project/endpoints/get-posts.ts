import { AppResponse, type Endpoint, faker } from "simapi";

export const getPosts: Endpoint = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  handler: () => {
    return AppResponse.success({
      data: AppResponse.array(5, () => ({
        id: faker.string.ulid(),
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        published: faker.boolean(),
      })),
      meta: { total: 5, page: 1, perPage: 20 },
    });
  },
};
