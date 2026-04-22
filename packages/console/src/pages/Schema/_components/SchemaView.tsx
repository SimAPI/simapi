import type { EndpointInfo } from "../../../types.js";
import { METHOD_COLORS } from "../_constants.js";
import { SchemaField } from "./SchemaField.js";

export function SchemaView({ endpoint }: { endpoint: EndpointInfo }) {
  return (
    <div className="space-y-32">
      {/* Request Definition Map */}
      <div className="space-y-12">
        {/* Request Body Section */}
        {(endpoint.schema?.properties || endpoint.formSchema?.properties) && (
          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">
                Request Body
              </h2>
              <div className="h-px flex-1 bg-zinc-100 dark:bg-white/5" />
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest bg-zinc-50 dark:bg-white/2 px-3 py-1 rounded-full border border-zinc-100 dark:border-white/5">
                {endpoint.formSchema
                  ? "multipart/form-data"
                  : "application/json"}
              </span>
            </div>
            <div className="divide-y divide-zinc-50 dark:divide-white/2">
              {endpoint.schema?.properties &&
                Object.entries(endpoint.schema.properties).map(
                  ([key, prop]) => (
                    <SchemaField
                      key={key}
                      name={key}
                      prop={prop}
                      required={
                        endpoint.schema?.required?.includes(key) ?? false
                      }
                    />
                  ),
                )}
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
                  ),
                )}
            </div>
          </section>
        )}

        {/* Query Parameters Section */}
        {endpoint.querySchema?.properties && (
          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">
                Parameters
              </h2>
              <div className="h-px flex-1 bg-zinc-100 dark:bg-white/5" />
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest bg-zinc-50 dark:bg-white/2 px-3 py-1 rounded-full border border-zinc-100 dark:border-white/5">
                Query
              </span>
            </div>
            <div className="divide-y divide-zinc-50 dark:divide-white/2">
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
                ),
              )}
            </div>
          </section>
        )}

        {/* Headers Section */}
        {endpoint.headerSchema?.properties && (
          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">
                Headers
              </h2>
              <div className="h-px flex-1 bg-zinc-100 dark:bg-white/5" />
            </div>
            <div className="divide-y divide-zinc-50 dark:divide-white/2">
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
                ),
              )}
            </div>
          </section>
        )}
      </div>

      {/* Response Specification */}
      <section className="space-y-12">
        <div className="flex items-center justify-between gap-6">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
            Responses
          </h2>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono">
                200 OK
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/10 dark:border-orange-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 font-mono">
                422 ERROR
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
              Expected Success Payload
            </span>
            <div className="h-px flex-1 bg-zinc-50 dark:bg-white/2" />
          </div>

          {endpoint.responseExample ? (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-10 blur-2xl transition duration-1000" />
              <div className="relative rounded-3xl bg-zinc-900 dark:bg-[#0d1117] border border-zinc-800 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-white/2 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                  </div>
                  <button
                    type="button"
                    className="text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        JSON.stringify(endpoint.responseExample, null, 2),
                      )
                    }
                  >
                    Copy Prototype
                  </button>
                </div>
                <pre className="p-8 text-[13px] text-zinc-400 font-mono overflow-x-auto leading-relaxed scrollbar-none">
                  {JSON.stringify(endpoint.responseExample, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="py-12 border-2 border-dashed border-zinc-100 dark:border-white/3 rounded-3xl flex items-center justify-center">
              <span className="text-[11px] font-black text-zinc-300 dark:text-zinc-800 uppercase tracking-widest">
                No example available
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
