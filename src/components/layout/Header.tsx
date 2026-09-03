import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserBottomNav } from "@/components/navigation/UserBottomNav";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { HeaderUserMenu } from "./HeaderUserMenu";
import { getCurrentUser } from "@/lib/auth";

const navLinkClass =
  "text-sm text-foreground-muted transition-colors hover:text-foreground";
const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

export async function Header() {
  const [t, tCommon, user] = await Promise.all([
    getTranslations("header"),
    getTranslations("common"),
    getCurrentUser(),
  ]);

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
            <HeaderUserMenu user={user} />
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
