"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type CheckoutTarget =
  | { type: "course"; courseId: string }
  | { type: "module"; moduleId: string }
  | { type: "video"; videoId: string }
  | { type: "subscription"; months: 1 | 3 | 6 };

export function TestCheckoutButton({
  target,
  className = "",
}: {
  target: CheckoutTarget;
  className?: string;
}) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function checkout() {
    setStatus("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/checkout/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target),
      });
      const data = await response.json();
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) {
        setStatus(data.error ?? t("checkoutFailed"));
        return;
      }
      setStatus(data.message);
      router.refresh();
      setTimeout(() => router.push("/dashboard"), 600);
    } catch {
      setStatus(t("serverError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={className}>
      <Button type="button" onClick={checkout} disabled={isSubmitting} className="w-full">
        {isSubmitting ? t("processing") : t("testPayment")}
      </Button>
      {status && (
        <p role="status" className="mt-2 text-center text-xs text-foreground-muted">
          {status}
        </p>
      )}
    </div>
  );
}
