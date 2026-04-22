import type { EndpointInfo } from "../../../types.js";
import type { AuthState } from "../_types.js";
import { buildAuthHeaders, buildAuthQuery } from "../_utils.js";

export function CurlSample({
  endpoint,
  auth,
  pathParams,
  queryRows,
  bodyType,
  bodyText,
  formRows,
  omittedFields,
}: {
  endpoint: EndpointInfo;
  auth: AuthState;
  pathParams: Record<string, string>;
  queryRows: [string, string][];
  bodyType: "json" | "form";
  bodyText: string;
  formRows: [string, string][];
  omittedFields: Set<string>;
}) {
  const buildUrl = () => {
    let url = endpoint.path;
    for (const [key, value] of Object.entries(pathParams)) {
      url = url.replace(`:${key}`, value || `:${key}`);
    }
    const q = [...queryRows, ...buildAuthQuery(auth)].filter(
      ([key]) => key && !omittedFields.has(`query:${key}`)
    );
    if (q.length > 0) {
      const sp = new URLSearchParams(q);
      url += `?${sp.toString()}`;
    }
    return url;
  };

  const generateCurl = () => {
    const parts = ["curl", "--request", endpoint.method, `"${buildUrl()}"`];

    const headers = buildAuthHeaders(auth);
    if (bodyType === "json") {
      headers["Content-Type"] = "application/json";
    }

    for (const [key, value] of Object.entries(headers)) {
      parts.push("--header", `"${key}: ${value}"`);
    }

    if (["POST", "PUT", "PATCH"].includes(endpoint.method)) {
      if (bodyType === "json" && bodyText) {
        try {
          const parsed = JSON.parse(bodyText);
          const filtered = Object.fromEntries(
            Object.entries(parsed).filter(
              ([key]) => !omittedFields.has(`body:${key}`)
            )
          );
          parts.push("--data", `'${JSON.stringify(filtered)}'`);
        } catch {
          parts.push("--data", `'${bodyText}'`);
        }
      } else if (bodyType === "form") {
        for (const [key, value] of formRows) {
          if (key && !omittedFields.has(`body:${key}`)) {
            parts.push("--form", `"${key}=${value}"`);
          }
        }
      }
    }

    return parts.join(" \\\n  ");
  };

  return (
    <div className="bg-white dark:bg-[#161b22] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#161b22] flex items-center justify-between">
        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Request Sample
        </span>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(generateCurl())}
          className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed bg-[#f6f8fa] dark:bg-[#0d1117]">
        {generateCurl()}
      </pre>
    </div>
  );
}
