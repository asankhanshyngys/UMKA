import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AdminNavigation } from "@/components/navigation/AdminNavigation";
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
      <AdminNavigation adminName={admin.name} brand={tCommon("brand")} panel={t("panel")} site={t("site")} />
      <div className="px-4 py-8 sm:px-6 lg:ml-[252px] lg:px-12 xl:ml-[268px] xl:px-20"><main className="min-w-0">{children}</main></div>
    </div>
  );
}
