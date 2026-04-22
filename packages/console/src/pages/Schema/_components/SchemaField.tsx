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
    <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-zinc-50 dark:border-zinc-800/60 last:border-0 items-baseline">
      <div className="col-span-4 font-mono text-xs text-zinc-800 dark:text-zinc-200">
        {name}
        {required && <span className="text-red-400 ml-0.5 text-[10px]">*</span>}
      </div>
      <div className="col-span-3 font-mono text-xs text-cyan-600 dark:text-cyan-400">
        {typeLabel(prop)}
      </div>
      <div className="col-span-2">
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            required
              ? "bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
          }`}
        >
          {required ? "required" : "optional"}
        </span>
      </div>
      <div className="col-span-3 text-[10px] text-zinc-400 dark:text-zinc-500">
        {constraints.join(", ")}
        {prop.default !== undefined && (
          <div className="mt-0.5 text-[9px] text-zinc-400 dark:text-zinc-500 italic">
            default: {JSON.stringify(prop.default)}
          </div>
        )}
      </div>
    </div>
  );
}
