"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type AdminSubmitButtonProps = Omit<ComponentProps<"button">, "children" | "type"> & {
  children: ReactNode;
  pendingLabel: string;
};

export function AdminSubmitButton({
  children,
  pendingLabel,
  className = "",
  disabled = false,
  ...props
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className={`${className} disabled:cursor-wait disabled:opacity-70`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
