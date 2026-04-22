import type { InputHTMLAttributes } from "react";

export const inputCls =
  "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 dark:focus:border-cyan-600 transition-colors placeholder-zinc-400 dark:placeholder-zinc-500";

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
