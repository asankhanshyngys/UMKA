"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";

const labels: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  kz: "KZ",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();

  async function setLocale(next: Locale) {
    if (next === locale) return;

    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });

    router.refresh();
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            loc === locale
              ? "bg-accent text-white"
              : "text-foreground-muted hover:text-foreground"
          }`}
          aria-current={loc === locale ? "true" : undefined}
        >
          {labels[loc]}
        </button>
      ))}
    </div>
  );
}
