import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium disabled:opacity-60";

  const variants = {
    primary: "bg-accent text-white hover:bg-accent-dark",
    secondary:
      "border border-border bg-transparent text-foreground hover:bg-card",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
