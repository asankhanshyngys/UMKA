"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function SignOutButton() {
  const router = useRouter();
  const t = useTranslations("account");

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="mt-6 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
    >
      {t("signOut")}
    </button>
  );
}
