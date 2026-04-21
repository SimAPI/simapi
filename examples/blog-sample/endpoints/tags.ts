import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
} from "@simapi/simapi";
import { makePost } from "../models/post.js";
import { allTags, makeTag } from "../models/tag.js";

export const listTags: EndpointDefinition = {
  path: "/api/tags",
  method: "GET",
  type: "open",
  title: "List Tags",
  description: "Returns all tags ordered by post count.",
  handler: () => AppResponse.success({ data: allTags() }),
};

export const getTagPosts: EndpointDefinition = {
  path: "/api/tags/:slug/posts",
  method: "GET",
  type: "open",
  title: "Posts by Tag",
  description: "Returns paginated posts that have a given tag.",
  delay: 150,
  handler: (req: AppRequest) => {
    const slug = req.urlParam("slug") ?? "react";
    return AppResponse.success({
      tag: { ...makeTag(), slug },
      data: AppResponse.array(8, () => makePost("published")),
      meta: { total: 8, slug },
    });
  },
};
