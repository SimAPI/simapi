import type { EndpointInfo } from "../../../types.js";
import { METHOD_COLORS } from "../_constants.js";
import { SchemaField } from "./SchemaField.js";

export function SchemaView({ endpoint }: { endpoint: EndpointInfo }) {
  return (
    <div className="space-y-16">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded text-[11px] font-black tracking-widest border uppercase ${
              METHOD_COLORS[endpoint.method] || "bg-zinc-100 text-zinc-500"
            }`}
          >
            {endpoint.method}
          </span>
          <code className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
            {endpoint.path}
          </code>
        </div>
        {endpoint.description && (
          <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
            {endpoint.description}
          </p>
        )}
      </div>

      {/* Request Body Schema */}
      {!!(endpoint.schema?.properties || endpoint.formSchema?.properties) && (
        <section>
          <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Request Body
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/40 px-2 py-0.5 rounded">
              {endpoint.formSchema ? "multipart/form-data" : "application/json"}
            </span>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/40">
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
        </section>
      )}

      {/* Query Parameters */}
      {!!endpoint.querySchema?.properties && (
        <section>
          <div className="mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Query Parameters
            </h2>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/40">
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
        </section>
      )}

      {/* Header Parameters */}
      {!!endpoint.headerSchema?.properties && (
        <section>
          <div className="mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Headers
            </h2>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/40">
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
        </section>
      )}

      {/* Responses */}
      <section>
        <div className="flex items-center gap-4 mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
          <h2 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Responses
          </h2>
          <div className="flex gap-2">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 font-mono">
              200
            </span>
            <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold border border-orange-500/20 font-mono">
              422
            </span>
            {endpoint.type === "secure" && (
              <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-500/20 font-mono">
                401
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              Success Body
            </h3>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/40 px-2 py-0.5 rounded uppercase">
              application/json
            </span>
          </div>

          {!!endpoint.responseExample && (
            <div className="rounded-xl bg-zinc-900 dark:bg-[#0d1117] border border-zinc-800 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/30 border-b border-zinc-800/50">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">
                  JSON Example
                </span>
                <button
                  type="button"
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors font-bold uppercase tracking-wider"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      JSON.stringify(endpoint.responseExample, null, 2)
                    )
                  }
                >
                  Copy
                </button>
              </div>
              <pre className="p-5 text-[12px] text-zinc-300 font-mono overflow-x-auto leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700">
                {JSON.stringify(endpoint.responseExample, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
