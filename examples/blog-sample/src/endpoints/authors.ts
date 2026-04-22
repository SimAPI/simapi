import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  z,
} from "@simapi/simapi";
import { makeAuthor } from "@/models/author.js";
import { makePost } from "@/models/post.js";

export const listAuthors: EndpointDefinition = {
  path: "/api/authors",
  method: "GET",
  type: "open",
  title: "List Authors",
  description: "Returns all active authors ordered by total views.",
  delay: 100,
  handler: () =>
    AppResponse.success({ data: AppResponse.array(10, makeAuthor) }),
};

export const getAuthor: EndpointDefinition = {
  path: "/api/authors/:id",
  method: "GET",
  type: "open",
  title: "Get Author",
  description: "Returns an author profile along with their most recent posts.",
  delay: 150,
  handler: (req: AppRequest) => {
    const author = { ...makeAuthor(), id: req.urlParam("id") };
    return AppResponse.success({
      data: author,
      recentPosts: AppResponse.array(6, () => makePost("published")),
    });
  },
};

export const updateProfile: EndpointDefinition = {
  path: "/api/profile",
  method: "PUT",
  type: "secure",
  title: "Update Profile",
  description: "Update the authenticated user's author profile.",
  validator: {
    name: z.string().min(2).max(100).optional(),
    bio: z.string().max(500).optional(),
    website: z.string().url().optional(),
    twitter: z.string().max(50).optional(),
  },
  handler: () => AppResponse.success({ data: makeAuthor() }),
};
