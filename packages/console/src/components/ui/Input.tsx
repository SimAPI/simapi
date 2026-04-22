import type { InputHTMLAttributes } from "react";

export const inputCls =
  "bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/30";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputCls} ${className}`} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputCls} ${className}`} {...props} />;
}
