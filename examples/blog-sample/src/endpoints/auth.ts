import { AppResponse, type EndpointDefinition, z } from "@simapi/simapi";

export const login: EndpointDefinition = {
  path: "/api/auth/login",
  method: "POST",
  type: "open",
  title: "Login",
  description:
    "Authenticate with email and password. Returns a bearer token on success.",
  request: {
    body: {
      email: z.string().email().default("johndoe@simapi.com"),
      password: z.string().min(8),
    },
  },
  handler: () =>
    AppResponse.success({
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo",
      expiresIn: 3600,
      user: {
        id: "01HV4Z6K8X1A2B3C4D5E6F7G8H",
        name: "Jane Doe",
        email: "jane@example.com",
        role: "editor",
      },
    }),
};

export const logout: EndpointDefinition = {
  path: "/api/auth/logout",
  method: "POST",
  type: "secure",
  title: "Logout",
  description: "Invalidate the current session token.",
  handler: () => AppResponse.noContent(),
};

export const refreshToken: EndpointDefinition = {
  path: "/api/auth/refresh",
  method: "POST",
  type: "open",
  title: "Refresh Token",
  description: "Exchange a refresh token for a new access token.",
  request: {
    body: {
      refreshToken: z.string().min(10),
    },
  },
  handler: () =>
    AppResponse.success({
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshed",
      expiresIn: 3600,
    }),
};

export const me: EndpointDefinition = {
  path: "/api/auth/me",
  method: "GET",
  type: "secure",
  title: "Get Current User",
  description: "Returns the authenticated user's profile.",
  handler: () =>
    AppResponse.success({
      id: "01HV4Z6K8X1A2B3C4D5E6F7G8H",
      name: "Jane Doe",
      email: "jane@example.com",
      role: "editor",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=jane",
      joinedAt: "2024-01-15T09:00:00.000Z",
    }),
};
