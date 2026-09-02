"use client";

import { BookOpen, Home, Library, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const items = [
  { href: "/dashboard", key: "dashboard", icon: Home },
  { href: "/courses", key: "myCourses", icon: BookOpen },
  { href: "/books", key: "books", icon: Library },
] as const;

export function UserBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  if (pathname.startsWith("/admin") || pathname.startsWith("/learn")) return null;

  return (
    <nav aria-label="User navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
      <div className="mx-auto grid h-16 max-w-md grid-cols-4 items-center">
        {items.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
          return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex h-full flex-col items-center justify-center gap-1 text-xs transition-colors ${active ? "text-accent" : "text-foreground-muted"}`}><Icon className="h-5 w-5" aria-hidden="true" />{t(key)}</Link>;
        })}
        <Link href="/dashboard" aria-label={t("more")} className="flex h-full flex-col items-center justify-center gap-1 text-xs text-foreground-muted"><MoreHorizontal className="h-5 w-5" aria-hidden="true" />{t("more")}</Link>
      </div>
    </nav>
  );
}
