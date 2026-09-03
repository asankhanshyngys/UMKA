import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { getDashboardCourses } from "@/features/dashboard/server";
import { getCurrentUser } from "@/lib/auth";
import Courses from "./Courses";
import { EmailVerificationNotice } from "@/components/auth/EmailVerificationNotice";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [t, dashboardCourses] = await Promise.all([
    getTranslations("dashboard"),
    getDashboardCourses(user),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="main-with-mobile-nav px-4 py-12 sm:px-6 lg:px-12 xl:px-20">
        <p className="text-sm text-foreground-subtle">{t("eyebrow")}</p>
        <h1 className="mt-1 font-serif text-4xl text-foreground">
          {t("greeting", { name: user.name })}
        </h1>
        <p className="mt-3 text-foreground-muted">{t("description")}</p>
        {!user.emailVerifiedAt && <EmailVerificationNotice email={user.email} />}
        <Courses data={dashboardCourses} />
      </main>
    </div>
  );
}
