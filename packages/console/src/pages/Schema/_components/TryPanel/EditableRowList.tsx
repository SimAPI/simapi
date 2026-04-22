interface EditableRowListProps {
  rows: [string, string][];
  onRowsChange: (rows: [string, string][]) => void;
  type: string;
  omittedFields: Set<string>;
  onToggleOmit: (key: string) => void;
}

export function EditableRowList({
  rows,
  onRowsChange,
  type,
  omittedFields,
  onToggleOmit,
}: EditableRowListProps) {
  const updateRow = (index: number, key: string, value: string) => {
    onRowsChange(rows.map((row, i) => (i === index ? [key, value] : row)));
  };

  const removeRow = (index: number) => {
    onRowsChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {rows.length === 0 && (
        <p className="text-[11px] text-muted-foreground italic pl-1">
          No entries
        </p>
      )}
      {rows.map(([key, value], index) => {
        const rowId = `${type}-${index}-${key}`;
        const isOmitted = omittedFields.has(`${type}:${key}`);
        return (
          <div
            key={rowId}
            className={`flex items-center gap-4 group transition-opacity ${
              isOmitted ? "opacity-40" : "opacity-100"
            }`}
          >
            <input
              className="w-32 bg-transparent border-b border-border focus:border-primary/50 outline-none py-1.5 transition-colors text-foreground placeholder:text-muted-foreground/30 font-mono"
              placeholder="key"
              value={key}
              onChange={(event) => updateRow(index, event.target.value, value)}
            />
            <span className="text-muted-foreground/40 font-bold">:</span>
            <input
              className="flex-1 bg-transparent border-b border-border focus:border-primary/50 outline-none py-1.5 transition-colors text-foreground placeholder:text-muted-foreground/30 font-mono"
              placeholder="value"
              value={value}
              onChange={(event) => updateRow(index, key, event.target.value)}
            />
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onToggleOmit(`${type}:${key}`)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isOmitted
                    ? "text-rose-500 bg-rose-500/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                title={isOmitted ? "Include in request" : "Omit from request"}
              >
                <svg
                  className="size-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>{isOmitted ? "Include" : "Omit"}</title>
                  {isOmitted ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  )}
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Remove row"
              >
                <svg
                  className="size-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Remove</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
