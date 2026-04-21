import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  z,
} from "simapi";
import { makeMedia } from "../models/media.js";

export const listMedia: EndpointDefinition = {
  path: "/api/media",
  method: "GET",
  type: "secure",
  title: "List Media",
  description: "Returns all uploaded media files for the current user.",
  delay: 100,
  handler: () =>
    AppResponse.success({
      data: [
        ...AppResponse.array(8, () => makeMedia("image")),
        ...AppResponse.array(2, () => makeMedia("document")),
      ],
      meta: { total: 10 },
    }),
};

export const uploadMedia: EndpointDefinition = {
  path: "/api/media",
  method: "POST",
  type: "secure",
  title: "Upload Media",
  description:
    "Upload a new media file. Accepts images (jpg, png, webp), videos and documents.",
  validator: {
    filename: z.string().min(3),
    mimeType: z.string(),
    size: z.number().int().positive().max(52428800),
  },
  delay: 600,
  handler: (req: AppRequest) =>
    AppResponse.created({
      data: {
        ...makeMedia("image"),
        filename: req.body<string>("filename"),
        mimeType: req.body<string>("mimeType"),
      },
    }),
};

export const deleteMedia: EndpointDefinition = {
  path: "/api/media/:id",
  method: "DELETE",
  type: "secure",
  title: "Delete Media",
  description: "Permanently deletes a media file.",
  handler: () => AppResponse.noContent(),
};
