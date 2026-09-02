"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type CheckoutTarget =
  | { type: "course"; courseId: string }
  | { type: "module"; moduleId: string }
  | { type: "book"; bookId: string }
  | { type: "subscription"; months: 1 | 3 | 6 };

export function WhatsAppCheckoutButton({
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
      const response = await fetch("/api/checkout/whatsapp", {
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

      window.open(data.waLink, "_blank", "noopener,noreferrer");
      setStatus(t("whatsappPending", { referenceCode: data.referenceCode }));
      router.refresh();
    } catch {
      setStatus(t("serverError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={className}>
      <Button type="button" onClick={checkout} disabled={isSubmitting} className="w-full">
        {isSubmitting ? t("processing") : t("payViaWhatsApp")}
      </Button>
      {status && (
        <p role="status" className="mt-2 text-center text-xs leading-relaxed text-foreground-muted">
          {status}
        </p>
      )}
    </div>
  );
}
