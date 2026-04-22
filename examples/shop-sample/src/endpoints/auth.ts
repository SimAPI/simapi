import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  z,
} from "@simapi/simapi";
import { makeCustomer } from "@/models/customer.js";

export const register: EndpointDefinition = {
  path: "/api/auth/register",
  method: "POST",
  type: "open",
  title: "Register",
  description: "Create a new customer account.",
  request: {
    body: {
      name: z.string().min(2).max(100),
      email: z.string().email(),
      password: z.string().min(8),
    },
  },
  handler: (req: AppRequest) =>
    AppResponse.created({
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo",
      customer: { ...makeCustomer(), email: req.body<string>("email") },
    }),
};

export const login: EndpointDefinition = {
  path: "/api/auth/login",
  method: "POST",
  type: "open",
  title: "Login",
  description: "Authenticate with email and password.",
  request: {
    body: {
      email: z.string().email(),
      password: z.string().min(8),
    },
  },
  handler: () =>
    AppResponse.success({
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo",
      expiresIn: 3600,
      customer: makeCustomer(),
    }),
};

export const getMe: EndpointDefinition = {
  path: "/api/me",
  method: "GET",
  type: "secure",
  title: "Get My Profile",
  description: "Returns the authenticated customer's profile and addresses.",
  handler: () => AppResponse.success({ data: makeCustomer() }),
};

export const updateMe: EndpointDefinition = {
  path: "/api/me",
  method: "PUT",
  type: "secure",
  title: "Update Profile",
  description: "Update name, email or phone number.",
  request: {
    body: {
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    },
  },
  handler: () => AppResponse.success({ data: makeCustomer() }),
};
