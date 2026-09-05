"use client";

import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { LoaderCircle } from "lucide-react";
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
  name,
  value,
  ...props
}: AdminSubmitButtonProps) {
  const { pending, data } = useFormStatus();
  const id = useId();
  const submitName = name ?? "__adminSubmit";
  const submitValue = value ?? id;
  const isSubmitting = pending && data?.get(submitName) === String(submitValue);

  return (
    <button
      {...props}
      type="submit"
      name={submitName}
      value={submitValue}
      disabled={disabled || pending}
      aria-busy={isSubmitting}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 ${className} disabled:opacity-70`}
    >
      {isSubmitting && <LoaderCircle aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" />}
      <span aria-live="polite" className="inline-flex items-center justify-center gap-2">
        {isSubmitting ? pendingLabel : children}
      </span>
    </button>
  );
}
