import { AppResponse } from "./AppResponse.js";
import type { AuthHandler } from "./defineConfig.js";

function parseCookies(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const idx = pair.indexOf("=");
    if (idx < 1) continue;
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (name) out[name] = value;
  }
  return out;
}

/**
 * Pre-built auth handler factories for common authentication schemes.
 * These handlers verify that the credential is present and well-formed —
 * they do not validate the actual credential value, which is correct
 * behaviour for a mock server.
 */
export const AuthHandlers = {
  /**
   * Requires `Authorization: Bearer <token>`.
   * Passes if any non-empty token is provided.
   */
  bearer(): AuthHandler {
    return (req) => {
      const auth = req.header("authorization");
      const token = auth?.toLowerCase().startsWith("bearer ")
        ? auth.slice(7).trim()
        : "";
      if (!token) {
        return AppResponse.unauthenticated({
          message: "Bearer token required (Authorization: Bearer <token>).",
        });
      }
    };
  },

  /**
   * Requires `Authorization: Bearer <header>.<payload>.<signature>`.
   * Validates that the token has the three-part JWT structure — does not
   * verify the signature.
   */
  jwt(): AuthHandler {
    return (req) => {
      const auth = req.header("authorization");
      const token = auth?.toLowerCase().startsWith("bearer ")
        ? auth.slice(7).trim()
        : "";
      if (!token || token.split(".").length !== 3) {
        return AppResponse.unauthenticated({
          message:
            "Valid JWT required (Authorization: Bearer <header>.<payload>.<sig>).",
        });
      }
    };
  },

  /**
   * Requires `Authorization: Basic <base64(username:password)>`.
   * Validates that the credential is properly base64-encoded and contains a colon.
   */
  basic(): AuthHandler {
    return (req) => {
      const auth = req.header("authorization");
      const encoded = auth?.toLowerCase().startsWith("basic ")
        ? auth.slice(6).trim()
        : "";
      if (!encoded) {
        return AppResponse.unauthenticated({
          message:
            "Basic credentials required (Authorization: Basic <base64(user:pass)>).",
        });
      }
      try {
        const decoded = Buffer.from(encoded, "base64").toString("utf8");
        if (!decoded.includes(":")) {
          return AppResponse.unauthenticated({
            message:
              "Invalid Basic credentials — expected base64(username:password).",
          });
        }
      } catch {
        return AppResponse.unauthenticated({
          message: "Invalid Basic credentials.",
        });
      }
    };
  },

  /**
   * Requires an API key passed via a request header or query parameter.
   *
   * @param name    Header name (e.g. `"x-api-key"`) or query param name (e.g. `"api_key"`).
   * @param via     Where to look: `"header"` (default) or `"queryParam"`.
   */
  apiKey(name: string, via: "header" | "queryParam" = "header"): AuthHandler {
    return (req) => {
      const value = via === "header" ? req.header(name) : req.param(name);
      if (!value?.trim()) {
        const location =
          via === "header" ? `${name} header` : `${name} query parameter`;
        return AppResponse.unauthenticated({
          message: `API key required (${location}).`,
        });
      }
    };
  },

  /**
   * Requires a specific cookie to be present on the request.
   *
   * @param name  Cookie name to check.
   */
  cookie(name: string): AuthHandler {
    return (req) => {
      const cookieHeader = req.header("cookie") ?? "";
      const cookies = parseCookies(cookieHeader);
      if (!cookies[name]) {
        return AppResponse.unauthenticated({
          message: `Authentication cookie "${name}" is required.`,
        });
      }
    };
  },

  /**
   * Requires an HMAC signature header.
   * Checks for `X-Signature`, `X-HMAC-Signature`, or `X-Hub-Signature-256`.
   * Does not verify the actual signature value.
   */
  hmac(): AuthHandler {
    return (req) => {
      const sig =
        req.header("x-signature") ??
        req.header("x-hmac-signature") ??
        req.header("x-hub-signature-256");
      if (!sig?.trim()) {
        return AppResponse.unauthenticated({
          message:
            "HMAC signature required (X-Signature or X-HMAC-Signature header).",
        });
      }
    };
  },

  /**
   * Requires HTTP Digest authentication.
   * Validates that the `Authorization: Digest ...` header is present.
   */
  digest(): AuthHandler {
    return (req) => {
      const auth = req.header("authorization");
      if (!auth?.toLowerCase().startsWith("digest ")) {
        return AppResponse.unauthenticated({
          message:
            "Digest authentication required (Authorization: Digest ...).",
        });
      }
    };
  },

  /**
   * Requires an OAuth 2.0 Bearer token in the Authorization header.
   * Functionally identical to `bearer()` — use when you want to be explicit
   * about the OAuth 2.0 scheme.
   */
  oauth2(): AuthHandler {
    return (req) => {
      const auth = req.header("authorization");
      const token = auth?.toLowerCase().startsWith("bearer ")
        ? auth.slice(7).trim()
        : "";
      if (!token) {
        return AppResponse.unauthenticated({
          message:
            "OAuth 2.0 Bearer token required (Authorization: Bearer <token>).",
        });
      }
    };
  },
};
