import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "xs" | "sm" | "md";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "sm",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-primary text-background hover:opacity-90 active:scale-[0.98]",
    secondary:
      "bg-secondary border border-border text-foreground hover:bg-border transition-all active:scale-[0.98]",
    danger: "bg-error text-background hover:opacity-90 active:scale-[0.98]",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
  };

  const sizes = {
    xs: "px-2 py-0.5 text-[10px]",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
