import type { EndpointInfo } from "../../../types.js";
import { SectionLabel } from "../../../components/ui/SectionLabel.js";
import { ResponseRow } from "./ResponseRow.js";
import { SchemaField } from "./SchemaField.js";

export function SchemaView({ endpoint }: { endpoint: EndpointInfo }) {
  return (
    <div className="space-y-12">
      {/* Request Body Schema */}
      {!!(endpoint.schema?.properties || endpoint.formSchema?.properties) && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Request Body
            </h2>
            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 font-mono uppercase tracking-wider">
              {endpoint.formSchema ? "multipart/form-data" : "application/json"}
            </span>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-2">
            {endpoint.schema?.properties &&
              Object.entries(endpoint.schema.properties).map(([key, prop]) => (
                <SchemaField
                  key={key}
                  name={key}
                  prop={prop}
                  required={endpoint.schema?.required?.includes(key) ?? false}
                />
              ))}
            {endpoint.formSchema?.properties &&
              Object.entries(endpoint.formSchema.properties).map(
                ([key, prop]) => (
                  <SchemaField
                    key={key}
                    name={key}
                    prop={prop}
                    required={
                      endpoint.formSchema?.required?.includes(key) ?? false
                    }
                  />
                )
              )}
          </div>
        </div>
      )}

      {/* Query Parameters */}
      {!!endpoint.querySchema?.properties && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Query Parameters
            </h2>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-2">
            {Object.entries(endpoint.querySchema.properties).map(
              ([key, prop]) => (
                <SchemaField
                  key={key}
                  name={key}
                  prop={prop}
                  required={
                    endpoint.querySchema?.required?.includes(key) ?? false
                  }
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Header Parameters */}
      {!!endpoint.headerSchema?.properties && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Headers
            </h2>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-2">
            {Object.entries(endpoint.headerSchema.properties).map(
              ([key, prop]) => (
                <SchemaField
                  key={key}
                  name={key}
                  prop={prop}
                  required={
                    endpoint.headerSchema?.required?.includes(key) ?? false
                  }
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Responses */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Responses
          </h2>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
              200
            </span>
            <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold border border-orange-500/20">
              422
            </span>
            {endpoint.type === "secure" && (
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-500/20">
                401
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              Body
            </h3>
            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 font-mono uppercase tracking-wider">
              application/json
            </span>
          </div>
          {!!endpoint.responseExample && (
            <div className="rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-mono">
                  JSON Response
                </span>
                <button
                  type="button"
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      JSON.stringify(endpoint.responseExample, null, 2)
                    )
                  }
                >
                  <span className="text-xs">Copy</span>
                </button>
              </div>
              <pre className="p-4 text-[11px] text-zinc-300 font-mono overflow-x-auto leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700">
                {JSON.stringify(endpoint.responseExample, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
