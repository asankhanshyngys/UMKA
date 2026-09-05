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
  const [manualWaLink, setManualWaLink] = useState<string | null>(null);

  async function checkout() {
    setStatus("");
    setManualWaLink(null);
    setIsSubmitting(true);
    let newWindow: Window | null = null;

    try {
      // Keep the handle: noopener in window.open's features would return null.
      newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.opener = null;
        const referrerPolicy = newWindow.document.createElement("meta");
        referrerPolicy.name = "referrer";
        referrerPolicy.content = "no-referrer";
        newWindow.document.head.appendChild(referrerPolicy);
      }

      const response = await fetch("/api/checkout/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target),
      });
      const data = await response.json();

      if (response.status === 401) {
        newWindow?.close();
        router.push("/login");
        return;
      }
      if (!response.ok) {
        newWindow?.close();
        setStatus(data.error ?? t("checkoutFailed"));
        return;
      }

      if (newWindow && !newWindow.closed) {
        newWindow.location.href = data.waLink;
      } else {
        setManualWaLink(data.waLink);
      }
      setStatus(t("whatsappPending", { referenceCode: data.referenceCode }));
      router.refresh();
    } catch {
      newWindow?.close();
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
      {manualWaLink && (
        <a
          href={manualWaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-xs leading-relaxed text-foreground-muted underline"
        >
          {t("openWhatsAppManually")}
        </a>
      )}
      {status && (
        <p role="status" className="mt-2 text-center text-xs leading-relaxed text-foreground-muted">
          {status}
        </p>
      )}
    </div>
  );
}
