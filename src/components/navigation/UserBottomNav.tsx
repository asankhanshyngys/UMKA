"use client";

import { BookOpen, Home, Library, LogIn, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

type User = { name: string; role: "USER" | "ADMIN" };

type UserBottomNavProps = {
  user: User | null;
};

const tabClass = "flex h-full flex-col items-center justify-center gap-1 text-xs transition-colors";

export function UserBottomNav({ user }: UserBottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const hideNav = pathname.startsWith("/admin") || pathname.startsWith("/learn");
  const cabinetHref = !user ? "/login" : user.role === "ADMIN" ? "/admin" : "/account";
  const homeActive = pathname === "/";
  const coursesActive = pathname.startsWith("/dashboard");
  const booksActive = pathname.startsWith("/library");
  const cabinetActive =
    pathname === "/login" ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/admin");

  if (hideNav) return null;

  return (
    <>
      <nav
        aria-label={t("ariaLabel")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
      >
        <div className="mx-auto grid h-16 max-w-md grid-cols-4 items-center">
          <Link
            href="/"
            aria-current={homeActive ? "page" : undefined}
            className={`${tabClass} ${homeActive ? "text-accent" : "text-foreground-muted"}`}
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            {t("home")}
          </Link>
          <Link
            href="/dashboard"
            aria-current={coursesActive ? "page" : undefined}
            className={`${tabClass} ${coursesActive ? "text-accent" : "text-foreground-muted"}`}
          >
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            {t("courses")}
          </Link>
          <Link
            href="/library"
            aria-current={booksActive ? "page" : undefined}
            className={`${tabClass} ${booksActive ? "text-accent" : "text-foreground-muted"}`}
          >
            <Library className="h-5 w-5" aria-hidden="true" />
            {t("books")}
          </Link>
          <Link
            href={cabinetHref}
            aria-current={cabinetActive ? "page" : undefined}
            className={`${tabClass} ${cabinetActive ? "text-accent" : "text-foreground-muted"}`}
          >
            {user ? (
              <UserRound className="h-5 w-5" aria-hidden="true" />
            ) : (
              <LogIn className="h-5 w-5" aria-hidden="true" />
            )}
            {user ? t("cabinet") : t("login")}
          </Link>
        </div>
      </nav>
    </>
  );
}
