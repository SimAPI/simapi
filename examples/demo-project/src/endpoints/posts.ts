import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  z,
} from "@simapi/simapi";
import { makePost } from "@/models/post.js";

export const listPosts: EndpointDefinition = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  title: "List Posts",
  description: "Returns a paginated list of all published posts.",
  handler: () =>
    AppResponse.success({
      data: AppResponse.array(10, makePost),
      meta: { total: 10, page: 1, perPage: 20 },
    }),
};

export const getPost: EndpointDefinition = {
  path: "/api/posts/:id",
  method: "GET",
  type: "open",
  title: "Get Post",
  description: "Returns a single post by ID.",
  delay: 400,
  failRate: 0.1,
  handler: (req: AppRequest) =>
    AppResponse.success({ data: { ...makePost(), id: req.urlParam("id") } }),
};

export const createPost: EndpointDefinition = {
  path: "/api/posts",
  method: "POST",
  type: "secure",
  title: "Create Post",
  description: "Creates a new post. Requires authentication.",
  request: {
    body: {
      title: z.string().min(3),
      body: z.string().min(10),
    },
  },
  handler: (req: AppRequest) => {
    req.errors.throwValidationError();
    return AppResponse.created({
      data: {
        ...makePost(),
        title: req.body<string>("title"),
        body: req.body<string>("body"),
        published: false,
      },
    });
  },
};

export const deletePost: EndpointDefinition = {
  path: "/api/posts/:id",
  method: "DELETE",
  type: "secure",
  title: "Delete Post",
  description: "Permanently deletes a post by ID. Requires authentication.",
  handler: () => AppResponse.noContent(),
};
