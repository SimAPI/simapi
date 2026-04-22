import type { EndpointInfo } from "../../../types.js";
import { SectionLabel } from "../../../components/ui/SectionLabel.js";
import { ResponseRow } from "./ResponseRow.js";
import { SchemaField } from "./SchemaField.js";

export function SchemaView({ endpoint }: { endpoint: EndpointInfo }) {
  return (
    <div className="space-y-6">
      {/* Description */}
      {endpoint.description && (
        <div>
          <SectionLabel>Description</SectionLabel>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {endpoint.description}
          </p>
        </div>
      )}

      {/* Request Body Schema */}
      {!!(endpoint.schema?.properties || endpoint.formSchema?.properties) && (
        <div>
          <SectionLabel>Request Properties</SectionLabel>
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800/60 overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/20">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              <div className="col-span-4">Field</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-2">Presence</div>
              <div className="col-span-3">Constraints</div>
            </div>
            {endpoint.schema?.properties &&
              Object.entries(endpoint.schema.properties).map(([k, p]) => (
                <SchemaField
                  key={k}
                  name={k}
                  prop={p}
                  required={endpoint.schema?.required?.includes(k) ?? false}
                />
              ))}
            {endpoint.formSchema?.properties &&
              Object.entries(endpoint.formSchema.properties).map(([k, p]) => (
                <SchemaField
                  key={k}
                  name={k}
                  prop={p}
                  required={endpoint.formSchema?.required?.includes(k) ?? false}
                />
              ))}
          </div>
        </div>
      )}

      {/* Query/Header Schemas omitted for brevity if not present, but let's add them if they exist */}
      {!!endpoint.querySchema?.properties && (
        <div>
          <SectionLabel>Query Parameters</SectionLabel>
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800/60 overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/20">
            {Object.entries(endpoint.querySchema.properties).map(([k, p]) => (
              <SchemaField
                key={k}
                name={k}
                prop={p}
                required={endpoint.querySchema?.required?.includes(k) ?? false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Response Example */}
      {!!endpoint.responseExample && (
        <div>
          <SectionLabel>Example Response</SectionLabel>
          <pre className="p-4 rounded-lg bg-zinc-900 text-zinc-300 text-xs font-mono overflow-x-auto leading-relaxed border border-zinc-800">
            {JSON.stringify(endpoint.responseExample, null, 2)}
          </pre>
        </div>
      )}

      {/* Standard Responses */}
      <div>
        <SectionLabel>Possible Responses</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-3">
          <ResponseRow
            status="200"
            description="Success — request completed normally."
            color="bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
          />
          <ResponseRow
            status="422"
            description="Validation Error — invalid request data."
            color="bg-orange-50/50 dark:bg-orange-950/10 border-orange-100/50 dark:border-orange-900/30 text-orange-700 dark:text-orange-400"
          />
          {endpoint.type === "secure" && (
            <ResponseRow
              status="401"
              description="Unauthenticated — missing or invalid token."
              color="bg-red-50/50 dark:bg-red-950/10 border-red-100/50 dark:border-red-900/30 text-red-700 dark:text-red-400"
            />
          )}
          <ResponseRow
            status="500"
            description="Server Error — simulated or unexpected failure."
            color="bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
          />
        </div>
      </div>
    </div>
  );
}
