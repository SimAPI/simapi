import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
} from "@simapi/simapi";
import { allCategories, makeCategory } from "@/models/category.js";
import { makePost } from "@/models/post.js";

export const listCategories: EndpointDefinition = {
  path: "/api/categories",
  method: "GET",
  type: "open",
  title: "List Categories",
  description: "Returns all blog categories with post counts.",
  handler: () => AppResponse.success({ data: allCategories() }),
};

export const getCategory: EndpointDefinition = {
  path: "/api/categories/:slug",
  method: "GET",
  type: "open",
  title: "Get Category",
  description: "Returns a category and its most recent posts.",
  handler: (req: AppRequest) => {
    const slug = req.urlParam("slug") ?? "technology";
    return AppResponse.success({
      data: { ...makeCategory(), slug },
      posts: AppResponse.array(8, () => ({
        ...makePost("published"),
        categorySlug: slug,
      })),
    });
  },
};
