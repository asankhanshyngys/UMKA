import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, Layers3, PlayCircle, UserRound } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TestCheckoutButton } from "@/features/checkout/TestCheckoutButton";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const localeMap = { en: "en-US", ru: "ru-RU", kz: "kk-KZ" } as const;

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [t, locale, course, user] = await Promise.all([
    getTranslations("courseDetail"),
    getLocale(),
    prisma.course.findFirst({
      where: { id, status: "PUBLISHED", deletedAt: null },
      include: {
        instructor: true,
        modules: {
          where: { deletedAt: null },
          orderBy: { order: "asc" },
          include: { videos: { where: { deletedAt: null }, orderBy: { order: "asc" } } },
        },
      },
    }),
    getCurrentUser(),
  ]);
  if (!course) notFound();

  const now = new Date();
  const [subscription, coursePurchase, modulePurchases] = user && user.role !== "ADMIN"
    ? await Promise.all([
        prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: now } } }),
        prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: course.id, status: "COMPLETED", expiresAt: { gt: now } } }),
        prisma.modulePurchase.findMany({ where: { userId: user.id, status: "COMPLETED", expiresAt: { gt: now }, module: { courseId: course.id } }, select: { moduleId: true } }),
      ])
    : [null, null, []];
  const hasFullAccess = user?.role === "ADMIN" || Boolean(subscription) || Boolean(coursePurchase);
  const purchasedModuleIds = new Set(modulePurchases.map((purchase) => purchase.moduleId));
  const lessonCount = course.modules.reduce((total, courseModule) => total + courseModule.videos.length, 0);
  const formatPrice = (price: number) => `${price.toLocaleString(localeMap[locale as keyof typeof localeMap] ?? "en-US")} ₸`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-0 sm:py-12">
        <Link href="/#catalog" className="inline-flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t("backToCatalog")}
        </Link>

        <section className="mt-8 space-y-5">
          <div className="flex items-center gap-2 text-accent"><BookOpen className="h-5 w-5" /><span className="text-sm font-medium">{t(`difficulty.${course.difficulty}`)}</span></div>
          <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">{course.title}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-foreground-muted">{course.description}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground-subtle"><span className="flex items-center gap-2"><Layers3 className="h-4 w-4" />{t("moduleCount", { count: course.modules.length })}</span><span className="flex items-center gap-2"><PlayCircle className="h-4 w-4" />{t("lessonCount", { count: lessonCount })}</span><span className="flex items-center gap-2"><UserRound className="h-4 w-4" />{t("instructor", { name: course.instructor.name })}</span></div>
        </section>

        <Card className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm text-foreground-muted">{t("fullCourse")}</p><p className="mt-1 font-serif text-3xl text-foreground">{formatPrice(course.price)}</p></div>{hasFullAccess ? <div className="sm:text-right"><p className="mb-3 flex items-center gap-2 text-sm font-medium text-accent sm:justify-end"><CheckCircle2 className="h-4 w-4" />{t("fullAccess")}</p><Link href={`/learn/${course.id}`}><Button>{t("openCourse")}</Button></Link></div> : <TestCheckoutButton target={{ type: "course", courseId: course.id }} className="w-full sm:w-52" />}</Card>

        <section className="mt-14"><div className="mb-6 space-y-2"><p className="text-xs font-medium uppercase tracking-label text-foreground-subtle">{t("choosePath")}</p><h2 className="font-serif text-3xl text-foreground">{t("modulesTitle")}</h2><p className="max-w-2xl text-foreground-muted">{t("modulesDescription")}</p></div><div className="space-y-4">{course.modules.map((courseModule) => { const hasModuleAccess = hasFullAccess || purchasedModuleIds.has(courseModule.id); return <Card key={courseModule.id} className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">{t("moduleNumber", { count: courseModule.order })} · {t("lessonCount", { count: courseModule.videos.length })}</p><h3 className="mt-2 text-xl font-semibold text-foreground">{courseModule.title}</h3>{courseModule.description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-muted">{courseModule.description}</p>}</div><div className="min-w-44"><p className="text-lg font-semibold text-foreground">{formatPrice(courseModule.price)}</p>{hasModuleAccess ? <Link href={`/learn/module/${courseModule.id}`} className="mt-3 inline-block"><Button variant="secondary" className="px-4 py-2">{t("openModule")}</Button></Link> : <TestCheckoutButton target={{ type: "module", moduleId: courseModule.id }} className="mt-3" />}</div></div><ol className="mt-5 grid gap-2 border-t border-border pt-4 sm:grid-cols-2">{courseModule.videos.map((video, index) => <li key={video.id} className="flex items-center gap-3 rounded-xl bg-background px-3 py-3 text-sm text-foreground-muted"><span className="text-foreground-subtle">{String(index + 1).padStart(2, "0")}</span><div><p className="font-medium text-foreground">{video.title}</p><p className="mt-0.5 text-xs text-foreground-subtle">{t("lessonMeta", { count: Math.ceil(video.duration / 60) })}</p></div></li>)}</ol></Card>; })}</div></section>
      </main>
    </div>
  );
}
