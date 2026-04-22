import type { SelectHTMLAttributes } from "react";
import { inputCls } from "./Input.js";

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${inputCls} appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")] bg-position-[right_0.5rem_center] bg-no-repeat pr-7 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
