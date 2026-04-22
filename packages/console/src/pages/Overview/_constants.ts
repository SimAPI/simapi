export const INTERNAL_ENDPOINTS = [
  {
    method: "GET",
    path: "/__simapi/health",
    description: "Server health and metadata",
  },
  {
    method: "GET",
    path: "/__simapi/endpoints",
    description: "List all registered endpoints",
  },
  {
    method: "GET",
    path: "/__simapi/logs",
    description: "Paginated request log entries",
  },
  {
    method: "GET",
    path: "/__simapi/logs/stream",
    description: "Live log stream (SSE)",
  },
  {
    method: "DELETE",
    path: "/__simapi/logs",
    description: "Clear all log entries",
  },
  {
    method: "DELETE",
    path: "/__simapi/logs/:id",
    description: "Delete a log entry by ID",
  },
  {
    method: "GET",
    path: "/__simapi/console/",
    description: "This console UI",
  },
];

export const METHOD_COLORS: Record<string, string> = {
  GET: "bg-method-get/5 text-method-get border-method-get/10",
  POST: "bg-method-post/5 text-method-post border-method-post/10",
  DELETE: "bg-method-delete/5 text-method-delete border-method-delete/10",
};
