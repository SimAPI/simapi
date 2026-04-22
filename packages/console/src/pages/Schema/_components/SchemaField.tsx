import type { JsonSchemaProperty } from "../../../types.js";
import { typeLabel } from "../_utils.js";

export function SchemaField({
  name,
  prop,
  required,
}: {
  name: string;
  prop: JsonSchemaProperty;
  required: boolean;
}) {
  const constraints: string[] = [];
  if (prop.minLength !== undefined) constraints.push(`min ${prop.minLength}`);
  if (prop.maxLength !== undefined) constraints.push(`max ${prop.maxLength}`);
  if (prop.minimum !== undefined) constraints.push(`≥ ${prop.minimum}`);
  if (prop.maximum !== undefined) constraints.push(`≤ ${prop.maximum}`);
  if (prop.format) constraints.push(prop.format);

  return (
    <div className="relative pl-8 py-4 border-l border-zinc-100 dark:border-zinc-800/60 first:mt-2 last:mb-2">
      {/* Connector line */}
      <div className="absolute left-0 top-7 w-4 h-px bg-zinc-100 dark:border-zinc-800/60" />

      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {name}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
              {typeLabel(prop)}
            </span>
          </div>

          {constraints.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {constraints.map((c) => (
                <span
                  key={c}
                  className="px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {prop.default !== undefined && (
            <div className="mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 italic">
              default:{" "}
              <code className="text-zinc-500 dark:text-zinc-300">
                {JSON.stringify(prop.default)}
              </code>
            </div>
          )}
        </div>

        {required && (
          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-500/80 uppercase tracking-wider bg-orange-50/50 dark:bg-orange-500/5 px-1.5 py-0.5 rounded">
            required
          </span>
        )}
      </div>
    </div>
  );
}
