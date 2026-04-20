import { AppResponse, type EndpointDefinition, faker } from "simapi";

export const getPosts: EndpointDefinition = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  handler: () => {
    return AppResponse.success({
      data: AppResponse.array(5, () => ({
        id: faker.string.ulid(),
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        published: faker.datatype.boolean(),
      })),
      meta: { total: 5, page: 1, perPage: 20 },
    });
  },
};
