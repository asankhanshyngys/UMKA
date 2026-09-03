import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { EmailVerificationNotice } from "@/components/auth/EmailVerificationNotice";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "./SignOutButton";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const now = new Date();
  const [t, locale, subscription, coursePurchases, bookPurchases] = await Promise.all([
    getTranslations("account"),
    getLocale(),
    prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: now } },
      select: { expiresAt: true },
      orderBy: { expiresAt: "desc" },
    }),
    prisma.coursePurchase.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
        expiresAt: { gt: now },
        course: { status: "PUBLISHED", deletedAt: null },
      },
      select: { course: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bookPurchase.findMany({
      where: { userId: user.id, status: "COMPLETED", book: { deletedAt: null } },
      select: { book: { select: { id: true, title: true } } },
      orderBy: { purchasedAt: "desc" },
    }),
  ]);

  const subscriptionCourses = subscription
    ? await prisma.course.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const courses = subscription ? subscriptionCourses : coursePurchases.map((purchase) => purchase.course);
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const hasPurchases = courses.length > 0 || bookPurchases.length > 0 || Boolean(subscription);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="main-with-mobile-nav px-4 py-12 sm:px-6 lg:px-12 xl:px-20">
        <p className="text-sm text-foreground-subtle">{t("eyebrow")}</p>
        <h1 className="mt-1 font-serif text-4xl text-foreground">{t("title")}</h1>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
          <p className="mt-1 text-foreground-muted">{user.email}</p>
          <p className="mt-3 text-sm text-foreground-subtle">
            {user.emailVerifiedAt ? t("emailVerified") : t("emailNotVerified")}
          </p>
          {!user.emailVerifiedAt && <EmailVerificationNotice email={user.email} />}
          <SignOutButton />
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-2xl text-foreground">{t("purchasesTitle")}</h2>
          <p className="mt-2 text-foreground-muted">
            {subscription
              ? t("subscriptionUntil", { date: dateFormatter.format(subscription.expiresAt) })
              : t("subscriptionInactive")}
          </p>

          {hasPurchases ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {subscription && (
                <article className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-lg font-semibold text-foreground">{t("subscription")}</h3>
                  <p className="mt-2 text-sm text-foreground-muted">
                    {t("subscriptionUntil", { date: dateFormatter.format(subscription.expiresAt) })}
                  </p>
                </article>
              )}
              {courses.map((course) => (
                <article key={course.id} className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                  <p className="mt-2 text-sm text-foreground-muted">{t("course")}</p>
                </article>
              ))}
              {bookPurchases.map(({ book }) => (
                <article key={book.id} className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-lg font-semibold text-foreground">{book.title}</h3>
                  <p className="mt-2 text-sm text-foreground-muted">{t("book")}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-border bg-card p-6">
              <p className="text-foreground-muted">{t("emptyDescription")}</p>
              <Link href="/#catalog" className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
                {t("browseCatalog")}
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
