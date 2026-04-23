import { JsonView } from "../../../components/ui/JsonView.js";
import type { EndpointInfo } from "../../../types.js";
import { SchemaField } from "./SchemaField.js";

export function SchemaView({ endpoint }: { endpoint: EndpointInfo }) {
  return (
    <div className="space-y-16">
      {/* Request Definition Map */}
      <div className="space-y-8">
        {/* Request Body Section */}
        {(endpoint.schema?.properties || endpoint.formSchema?.properties) && (
          <section className="space-y-6">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-foreground tracking-tighter">
                Request Body
              </h2>
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-secondary px-3 py-1 rounded-full border border-border">
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
                  )
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
                  )
                )}
            </div>
          </section>
        )}

        {/* Query Parameters Section */}
        {endpoint.querySchema?.properties && (
          <section className="space-y-6">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-foreground tracking-tighter">
                Parameters
              </h2>
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-secondary px-3 py-1 rounded-full border border-border">
                Query
              </span>
            </div>
            <div className="divide-y divide-border/20">
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

        {/* Headers Section */}
        {endpoint.headerSchema?.properties && (
          <section className="space-y-6">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-foreground tracking-tighter">
                Headers
              </h2>
              <div className="h-px flex-1 bg-border/50" />
            </div>
            <div className="divide-y divide-border/20">
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
      </div>

      {/* Response Specification */}
      <section className="space-y-8">
        <div className="flex items-center justify-between gap-6">
          <h2 className="text-3xl font-black text-foreground tracking-tighter">
            Responses
          </h2>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/5 border border-success/10">
              <div className="size-1.5 rounded-full bg-success shadow-[0_0_8px_var(--color-success)]" />
              <span className="text-[10px] font-black text-success font-mono uppercase tracking-widest">
                200 OK
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-warning/5 border border-warning/10">
              <div className="size-1.5 rounded-full bg-warning shadow-[0_0_8px_var(--color-warning)]" />
              <span className="text-[10px] font-black text-warning font-mono uppercase tracking-widest">
                422 ERROR
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
              Expected Success Payload
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          {endpoint.responseExample ? (
            <JsonView
              data={endpoint.responseExample}
              title="Prototype Response"
            />
          ) : (
            <div className="py-12 border-2 border-dashed border-border/50 rounded-3xl flex items-center justify-center">
              <span className="text-[11px] font-black text-muted-foreground/30 uppercase tracking-widest">
                No example available
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
