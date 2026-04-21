import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  z,
} from "simapi";
import { makePost } from "../models/post.js";

export const listPosts: EndpointDefinition = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  title: "List Posts",
  description:
    "Returns a paginated list of published posts. Supports filtering by category, tag and status.",
  delay: 150,
  handler: (req: AppRequest) => {
    const page = Number(req.param("page") ?? "1");
    const perPage = Number(req.param("perPage") ?? "12");
    const posts = AppResponse.array(perPage, () => makePost("published"));

    return AppResponse.success({
      data: posts,
      meta: {
        total: 248,
        page,
        perPage,
        lastPage: Math.ceil(248 / perPage),
        category: req.param("category") ?? null,
        tag: req.param("tag") ?? null,
      },
    });
  },
};

export const getFeaturedPosts: EndpointDefinition = {
  path: "/api/posts/featured",
  method: "GET",
  type: "open",
  title: "Featured Posts",
  description: "Returns the current set of featured / hero posts.",
  handler: () =>
    AppResponse.success({
      data: AppResponse.array(3, () => ({
        ...makePost("published"),
        featured: true,
      })),
    }),
};

export const getPost: EndpointDefinition = {
  path: "/api/posts/:slug",
  method: "GET",
  type: "open",
  title: "Get Post",
  description: "Returns a single post by its URL slug including related posts.",
  delay: 200,
  failRate: 0.05,
  handler: (req: AppRequest) => {
    const post = {
      ...makePost("published"),
      slug: req.urlParam("slug") ?? "my-post",
    };
    return AppResponse.success({
      data: post,
      related: AppResponse.array(3, () => makePost("published")),
    });
  },
};

export const searchPosts: EndpointDefinition = {
  path: "/api/posts/search",
  method: "GET",
  type: "open",
  title: "Search Posts",
  description:
    "Full-text search across post titles, excerpts and body content.",
  delay: 300,
  handler: (req: AppRequest) => {
    const q = req.param("q") ?? "";
    if (!q)
      return AppResponse.success({ data: [], meta: { query: q, total: 0 } });
    return AppResponse.success({
      data: AppResponse.array(5, () => makePost("published")),
      meta: { query: q, total: 5 },
    });
  },
};

export const createPost: EndpointDefinition = {
  path: "/api/posts",
  method: "POST",
  type: "secure",
  title: "Create Post",
  description: "Creates a new post as a draft. Requires editor or admin role.",
  validator: {
    title: z.string().min(5).max(200),
    excerpt: z.string().min(10).max(500),
    body: z.string().min(50),
    categorySlug: z.string(),
    tags: z.array(z.string()).min(1).max(10),
    coverImage: z.string().url().optional(),
  },
  handler: (req: AppRequest) =>
    AppResponse.created({
      data: {
        ...makePost("draft"),
        title: req.body<string>("title"),
        excerpt: req.body<string>("excerpt"),
        status: "draft",
      },
    }),
};

export const updatePost: EndpointDefinition = {
  path: "/api/posts/:id",
  method: "PUT",
  type: "secure",
  title: "Update Post",
  description: "Updates an existing post. Partial updates are supported.",
  validator: {
    title: z.string().min(5).max(200).optional(),
    excerpt: z.string().min(10).max(500).optional(),
    body: z.string().min(50).optional(),
    categorySlug: z.string().optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().url().optional(),
  },
  handler: (req: AppRequest) =>
    AppResponse.success({
      data: { ...makePost("draft"), id: req.urlParam("id") },
    }),
};

export const publishPost: EndpointDefinition = {
  path: "/api/posts/:id/publish",
  method: "POST",
  type: "secure",
  title: "Publish Post",
  description:
    "Transitions a post from draft to published and sets publishedAt.",
  handler: (req: AppRequest) =>
    AppResponse.success({
      data: {
        ...makePost("published"),
        id: req.urlParam("id"),
        status: "published",
        publishedAt: new Date().toISOString(),
      },
    }),
};

export const archivePost: EndpointDefinition = {
  path: "/api/posts/:id/archive",
  method: "POST",
  type: "secure",
  title: "Archive Post",
  description:
    "Moves a post to the archived state. Archived posts are hidden from public listings.",
  handler: (req: AppRequest) =>
    AppResponse.success({
      data: {
        ...makePost("archived"),
        id: req.urlParam("id"),
        status: "archived",
      },
    }),
};

export const deletePost: EndpointDefinition = {
  path: "/api/posts/:id",
  method: "DELETE",
  type: "secure",
  title: "Delete Post",
  description:
    "Permanently deletes a post and all associated comments. This action cannot be undone.",
  handler: () => AppResponse.noContent(),
};
