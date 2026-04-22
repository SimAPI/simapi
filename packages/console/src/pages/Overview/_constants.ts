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
  GET: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900",
  POST: "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900",
  DELETE:
    "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900",
};
