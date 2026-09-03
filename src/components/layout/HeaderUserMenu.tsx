"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

type HeaderUser = {
  name: string;
  role: "USER" | "ADMIN";
};

type HeaderUserMenuProps = {
  user: HeaderUser;
};

const navLinkClass =
  "text-sm text-foreground-muted transition-colors hover:text-foreground";

export function HeaderUserMenu({ user }: HeaderUserMenuProps) {
  const t = useTranslations("header");
  const router = useRouter();
  const accountHref = user.role === "ADMIN" ? "/admin" : "/dashboard";

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="hidden items-center gap-3 sm:flex">
      <Link href={accountHref} className={navLinkClass}>
        {user.name}
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="text-sm text-foreground-muted underline hover:text-foreground"
      >
        {t("signOut")}
      </button>
    </div>
  );
}
