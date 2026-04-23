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
              required ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {name}
          </span>
          {required && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-warning/5 border border-warning/10">
              <div className="size-1 rounded-full bg-warning shadow-[0_0_8px_var(--color-warning)]" />
              <span className="text-[9px] font-black text-warning uppercase tracking-widest">
                Required
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black font-mono text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
            {typeLabel(prop)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {constraints.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
              Constraints
            </span>
            <div className="flex gap-1.5">
              {constraints.map((c) => (
                <span
                  key={c}
                  className="text-[11px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {prop.default !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
              Default
            </span>
            <span className="text-[11px] font-mono text-muted-foreground/60 italic bg-secondary px-2 py-0.5 rounded border border-border">
              {JSON.stringify(prop.default)}
            </span>
          </div>
        )}
      </div>

      <div className="absolute -left-8 top-8 bottom-8 w-[2px] bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hidden sm:block" />
    </div>
  );
}
