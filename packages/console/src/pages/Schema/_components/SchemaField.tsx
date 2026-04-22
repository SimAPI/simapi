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
    <div className="py-5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {name}
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              {typeLabel(prop)}
            </span>
            {required && (
              <span className="text-[9px] font-black text-orange-500/90 dark:text-orange-400/80 uppercase tracking-widest bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/10">
                Required
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {constraints.map((c) => (
              <span
                key={c}
                className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                {c}
              </span>
            ))}
            {prop.default !== undefined && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 italic flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                default: {JSON.stringify(prop.default)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
