import Link from "next/link";
import { BookOpen, LayoutDashboard, ExternalLink, GraduationCap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/dashboard");

  const t = await getTranslations("admin");
  const tCommon = await getTranslations("common");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-serif text-lg text-white">
              U
            </div>
            <div>
              <p className="text-sm font-semibold">{tCommon("brand")}</p>
              <p className="text-xs text-foreground-subtle">{t("panel")}</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <span className="hidden text-sm text-foreground-muted sm:inline">{admin.name}</span>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              {t("site")}
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-border bg-card p-3">
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground-muted transition-colors hover:bg-background hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t("overview")}
            </Link>
            <Link
              href="/admin/courses"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground-muted transition-colors hover:bg-background hover:text-foreground"
            >
              <BookOpen className="h-4 w-4" />
              {t("coursesLessons")}
            </Link>
            <Link
              href="/admin/teachers"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground-muted transition-colors hover:bg-background hover:text-foreground"
            >
              <GraduationCap className="h-4 w-4" />
              {t("teachers")}
            </Link>
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
