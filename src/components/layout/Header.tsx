"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserBottomNav } from "@/components/navigation/UserBottomNav";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

type User = { name: string; role: "USER" | "ADMIN" };

const navLinkClass =
  "text-sm text-foreground-muted transition-colors hover:text-foreground";
const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

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

  const accountHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <>
      <header className="relative flex items-center justify-between px-4 py-6 sm:px-6 lg:px-12 xl:px-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <span className="font-serif text-lg font-medium text-white">U</span>
          </div>
          <span className="text-sm font-medium text-foreground">{tCommon("brand")}</span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link href="/#subscriptions" className={`hidden sm:inline ${navLinkClass}`}>
            {t("subscriptions")}
          </Link>
          <Link href="/#catalog" className={`hidden sm:inline ${navLinkClass}`}>
            {t("courses")}
          </Link>
          <Link href="/books" className="hidden text-sm text-foreground-muted transition-colors hover:text-foreground sm:inline">
            Books
          </Link>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background hover:text-foreground"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
          {user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Link href={accountHref} className={navLinkClass}>
                {user.name}
              </Link>
              <button type="button" onClick={signOut} className="text-sm text-foreground-muted underline hover:text-foreground">
                {t("signOut")}
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-4 sm:flex">
              <Link href="/login" className={navLinkClass}>
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
      <UserBottomNav user={user} />
    </>
  );
}
