import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  z,
} from "@simapi/simapi";
import { makeUser } from "@/models/user.js";

export const listUsers: EndpointDefinition = {
  path: "/api/users",
  method: "GET",
  type: "secure",
  title: "List Users",
  description: "Returns all registered users. Requires authentication.",
  handler: () => AppResponse.success({ data: AppResponse.array(8, makeUser) }),
};

export const getUser: EndpointDefinition = {
  path: "/api/users/:id",
  method: "GET",
  type: "open",
  title: "Get User",
  description: "Returns a single user by ID.",
  handler: (req: AppRequest) =>
    AppResponse.success({ data: { ...makeUser(), id: req.urlParam("id") } }),
};

export const createUser: EndpointDefinition = {
  path: "/api/users",
  method: "POST",
  type: "open",
  title: "Create User",
  description: "Registers a new user account.",
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
