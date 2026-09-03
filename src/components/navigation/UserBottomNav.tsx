"use client";

import { BookOpen, Home, LogIn, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type User = { name: string; role: "USER" | "ADMIN" };

type UserBottomNavProps = {
  user: User | null;
  onSignOut: () => Promise<void>;
};

const tabClass = "flex h-full flex-col items-center justify-center gap-1 text-xs transition-colors";

export function UserBottomNav({ user, onSignOut }: UserBottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const sheetId = useId();
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const hideNav = pathname.startsWith("/admin") || pathname.startsWith("/learn");
  const cabinetHref = !user ? "/login" : user.role === "ADMIN" ? "/admin" : "/dashboard";
  const homeActive = pathname === "/";
  const coursesActive = pathname.startsWith("/courses");
  const cabinetActive =
    pathname === "/login" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin");
  const onUserCabinet =
    user?.role === "USER" && pathname.startsWith("/dashboard");

  if (hideNav) return null;

  return (
    <>
      <nav
        aria-label={t("ariaLabel")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
      >
        <div className="mx-auto grid h-16 max-w-md grid-cols-3 items-center">
          <Link
            href="/"
            aria-current={homeActive ? "page" : undefined}
            className={`${tabClass} ${homeActive ? "text-accent" : "text-foreground-muted"}`}
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            {t("home")}
          </Link>
          <Link
            href="/#catalog"
            aria-current={coursesActive ? "page" : undefined}
            className={`${tabClass} ${coursesActive ? "text-accent" : "text-foreground-muted"}`}
          >
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            {t("courses")}
          </Link>
          {!user ? (
            <Link
              href="/login"
              aria-current={cabinetActive ? "page" : undefined}
              className={`${tabClass} ${cabinetActive ? "text-accent" : "text-foreground-muted"}`}
            >
              <LogIn className="h-5 w-5" aria-hidden="true" />
              {t("login")}
            </Link>
          ) : onUserCabinet || user.role === "ADMIN" ? (
            <button
              type="button"
              aria-current={cabinetActive ? "page" : undefined}
              aria-expanded={sheetOpen}
              aria-controls={sheetId}
              aria-haspopup="dialog"
              onClick={() => setSheetOpen(true)}
              className={`${tabClass} ${cabinetActive || sheetOpen ? "text-accent" : "text-foreground-muted"}`}
            >
              <UserRound className="h-5 w-5" aria-hidden="true" />
              {t("cabinet")}
            </button>
          ) : (
            <Link
              href={cabinetHref}
              aria-current={cabinetActive ? "page" : undefined}
              className={`${tabClass} ${cabinetActive ? "text-accent" : "text-foreground-muted"}`}
            >
              <UserRound className="h-5 w-5" aria-hidden="true" />
              {t("cabinet")}
            </Link>
          )}
        </div>
      </nav>
      {sheetOpen && user && (
        <AccountSheet
          id={sheetId}
          userName={user.name}
          accountHref={cabinetHref}
          onClose={closeSheet}
          onSignOut={async () => {
            await onSignOut();
            closeSheet();
          }}
        />
      )}
    </>
  );
}

function AccountSheet({
  id,
  userName,
  accountHref,
  onClose,
  onSignOut,
}: {
  id: string;
  userName: string;
  accountHref: string;
  onClose: () => void;
  onSignOut: () => Promise<void>;
}) {
  const t = useTranslations("nav");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label={t("closeMenu")}
        onClick={onClose}
      />
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-sm"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <p id={`${id}-title`} className="px-3 text-sm font-medium text-foreground">
          {userName}
        </p>
        <div className="mt-2 flex flex-col gap-1">
          <Link
            href={accountHref}
            className="rounded-lg px-3 py-2.5 text-sm text-foreground-muted hover:bg-background hover:text-foreground"
            onClick={onClose}
          >
            {t("cabinet")}
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onSignOut}
            className="rounded-lg px-3 py-2.5 text-left text-sm text-foreground-muted underline hover:bg-background hover:text-foreground"
          >
            {t("signOut")}
          </button>
        </div>
      </div>
    </div>
  );
}
