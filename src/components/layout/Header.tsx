"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

type User = { name: string; role: "USER" | "ADMIN" };

export function Header() {
  const t = useTranslations("header");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => (response.ok ? response.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <span className="font-serif text-lg font-medium text-white">U</span>
        </div>
        <span className="text-sm font-medium text-foreground">{tCommon("brand")}</span>
      </Link>
      <nav className="flex items-center gap-3 sm:gap-5">
        <Link
          href="/#subscriptions"
          className="hidden text-sm text-foreground-muted transition-colors hover:text-foreground sm:inline"
        >
          {t("subscriptions")}
        </Link>
        <Link
          href="/#catalog"
          className="hidden text-sm text-foreground-muted transition-colors hover:text-foreground sm:inline"
        >
          {t("courses")}
        </Link>
        <LanguageSwitcher />
        <ThemeToggle />
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
              className="text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              {user.name}
            </Link>
            <button
              onClick={signOut}
              className="text-sm text-foreground-muted underline hover:text-foreground"
            >
              {t("signOut")}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              {t("login")}
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-accent px-3 py-2 text-sm text-white transition-colors hover:bg-accent-dark"
            >
              {t("register")}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
