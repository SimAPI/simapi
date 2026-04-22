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
  if (prop.minLength !== undefined) constraints.push(`min:${prop.minLength}`);
  if (prop.maxLength !== undefined) constraints.push(`max:${prop.maxLength}`);
  if (prop.minimum !== undefined) constraints.push(`min:${prop.minimum}`);
  if (prop.maximum !== undefined) constraints.push(`max:${prop.maximum}`);
  if (prop.format) constraints.push(prop.format);

  return (
    <div
      className={`py-6 relative transition-all group ${
        required ? "opacity-100" : "opacity-80 hover:opacity-100"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-black tracking-tight font-mono ${
              required
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {name}
          </span>
          {required && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/10 dark:border-orange-500/20">
              <div className="w-1 h-1 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                Required
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/5 dark:bg-cyan-500/10 px-2 py-0.5 rounded">
            {typeLabel(prop)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {constraints.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
              Constraints
            </span>
            <div className="flex gap-1.5">
              {constraints.map((c) => (
                <span
                  key={c}
                  className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/2 px-2 py-0.5 rounded border border-zinc-100 dark:border-white/3"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {prop.default !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
              Default
            </span>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 italic bg-zinc-50 dark:bg-white/2 px-2 py-0.5 rounded border border-zinc-100 dark:border-white/3">
              {JSON.stringify(prop.default)}
            </span>
          </div>
        )}
      </div>

      <div className="absolute -left-8 top-8 bottom-8 w-[2px] bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hidden sm:block" />
    </div>
  );
}
