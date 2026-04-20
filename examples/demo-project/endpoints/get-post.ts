import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  faker,
} from "simapi";

export const getPost: EndpointDefinition = {
  path: "/api/posts/:id",
  method: "GET",
  type: "open",
  delay: 1000,
  failRate: 0.3,
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
};
