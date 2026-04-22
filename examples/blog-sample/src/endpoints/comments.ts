import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  z,
} from "@simapi/simapi";
import { makeComment } from "@/models/comment.js";

export const listComments: EndpointDefinition = {
  path: "/api/posts/:postId/comments",
  method: "GET",
  type: "open",
  title: "List Comments",
  description:
    "Returns approved comments for a post, threaded by parent/reply.",
  delay: 100,
  handler: (req: AppRequest) => {
    const postId = req.urlParam("postId") ?? "";
    return AppResponse.success({
      data: AppResponse.array(8, () => makeComment(postId, "approved")),
      meta: { total: 8, postId },
    });
  },
};

export const addComment: EndpointDefinition = {
  path: "/api/posts/:postId/comments",
  method: "POST",
  type: "open",
  title: "Add Comment",
  description:
    "Adds a comment to a post. Comments are held for moderation before appearing.",
  validator: {
    authorName: z.string().min(2).max(80),
    authorEmail: z.string().email(),
    body: z.string().min(5).max(2000),
    parentId: z.string().optional(),
  },
  handler: (req: AppRequest) =>
    AppResponse.created({
      data: {
        ...makeComment(req.urlParam("postId")),
        status: "pending",
        authorName: req.body<string>("authorName"),
        body: req.body<string>("body"),
      },
      message: "Your comment has been submitted and is pending approval.",
    }),
};

export const approveComment: EndpointDefinition = {
  path: "/api/comments/:id/approve",
  method: "PUT",
  type: "secure",
  title: "Approve Comment",
  description: "Approves a pending comment so it appears publicly.",
  handler: (req: AppRequest) =>
    AppResponse.success({
      data: {
        ...makeComment(undefined, "approved"),
        id: req.urlParam("id"),
        status: "approved",
      },
    }),
};

export const rejectComment: EndpointDefinition = {
  path: "/api/comments/:id/reject",
  method: "PUT",
  type: "secure",
  title: "Reject Comment",
  description: "Rejects a comment so it is never shown publicly.",
  handler: (req: AppRequest) =>
    AppResponse.success({
      data: {
        ...makeComment(undefined, "rejected"),
        id: req.urlParam("id"),
        status: "rejected",
      },
    }),
};

export const deleteComment: EndpointDefinition = {
  path: "/api/comments/:id",
  method: "DELETE",
  type: "secure",
  title: "Delete Comment",
  description: "Permanently deletes a comment.",
  handler: () => AppResponse.noContent(),
};

export const listPendingComments: EndpointDefinition = {
  path: "/api/comments/pending",
  method: "GET",
  type: "secure",
  title: "List Pending Comments",
  description: "Returns all comments awaiting moderation across all posts.",
  handler: () =>
    AppResponse.success({
      data: AppResponse.array(6, () => makeComment(undefined, "pending")),
      meta: { total: 6 },
    }),
};
