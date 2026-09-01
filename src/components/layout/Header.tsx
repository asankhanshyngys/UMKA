"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

type User = { name: string; role: "USER" | "ADMIN" };

const navLinkClass =
  "text-sm text-foreground-muted transition-colors hover:text-foreground";

export function Header() {
  const t = useTranslations("header");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => (response.ok ? response.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    firstItemRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [menuOpen]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const accountHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
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
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          ref={buttonRef}
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground-muted transition-colors hover:bg-card hover:text-foreground sm:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-haspopup="true"
          aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        {user ? (
          <div className="hidden items-center gap-3 sm:flex">
            <Link href={accountHref} className={navLinkClass}>
              {user.name}
            </Link>
            <button onClick={signOut} className="text-sm text-foreground-muted underline hover:text-foreground">
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
      {menuOpen && (
        <div
          ref={panelRef}
          id={menuId}
          className="absolute right-6 top-full z-50 mt-1 w-[min(18rem,calc(100%-3rem))] rounded-2xl border border-border bg-card p-3 shadow-sm sm:hidden"
        >
          <div className="flex flex-col gap-1">
            <Link
              ref={firstItemRef}
              href="/#subscriptions"
              className="rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-background hover:text-foreground"
              onClick={closeMenu}
            >
              {t("subscriptions")}
            </Link>
            <Link
              href="/#catalog"
              className="rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-background hover:text-foreground"
              onClick={closeMenu}
            >
              {t("courses")}
            </Link>
            <div className="my-1 border-t border-border" />
            {user ? (
              <>
                <Link
                  href={accountHref}
                  className="rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-background hover:text-foreground"
                  onClick={closeMenu}
                >
                  {user.name}
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-lg px-3 py-2 text-left text-sm text-foreground-muted underline hover:bg-background hover:text-foreground"
                >
                  {t("signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-background hover:text-foreground"
                  onClick={closeMenu}
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="mt-1 rounded-lg bg-accent px-3 py-2 text-center text-sm text-white transition-colors hover:bg-accent-dark"
                  onClick={closeMenu}
                >
                  {t("register")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
