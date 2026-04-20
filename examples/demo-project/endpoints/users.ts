import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  z,
} from "simapi";
import { makeUser } from "../models/user.js";

export const listUsers: EndpointDefinition = {
  path: "/api/users",
  method: "GET",
  type: "secure",
  handler: () => AppResponse.success({ data: AppResponse.array(8, makeUser) }),
};

export const getUser: EndpointDefinition = {
  path: "/api/users/:id",
  method: "GET",
  type: "open",
  handler: (req: AppRequest) =>
    AppResponse.success({ data: { ...makeUser(), id: req.urlParam("id") } }),
};

export const createUser: EndpointDefinition = {
  path: "/api/users",
  method: "POST",
  type: "open",
  validator: {
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
  },
  handler: (req: AppRequest) => {
    req.errors.throwValidationError();
    return AppResponse.created({
      data: { ...makeUser(), email: req.body<string>("email") },
    });
  },
};
