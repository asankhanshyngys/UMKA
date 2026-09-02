import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { LocalLessonPlayer } from "@/components/course/LocalLessonPlayer";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toLearnerPractices } from "@/lib/practice-presentation";

export const dynamic = "force-dynamic";

export default async function LearnCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [t, user] = await Promise.all([getTranslations("learn"), getCurrentUser()]);
  if (!user) redirect("/login");

  const now = new Date();
  const [subscription, purchase, course, practiceResults] = await Promise.all([
    user.role === "ADMIN" ? null : prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: now } } }),
    user.role === "ADMIN" ? null : prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: id, status: "COMPLETED", expiresAt: { gt: now } } }),
    prisma.course.findFirst({ where: { id, status: "PUBLISHED", deletedAt: null }, include: { modules: { where: { deletedAt: null }, orderBy: { order: "asc" }, include: { videos: { where: { deletedAt: null }, orderBy: { order: "asc" }, include: { practices: { include: { sections: { orderBy: { order: "asc" }, include: { questions: { include: { answers: true } } } } } } } } } } } }),
    prisma.practiceResult.findMany({ where: { userId: user.id, completed: true, practice: { video: { module: { courseId: id } } } }, select: { practiceId: true } }),
  ]);
  if (!course) notFound();
  if (user.role !== "ADMIN" && !subscription && !purchase) redirect(`/courses/${course.id}`);

  const rawLessons = course.modules.flatMap((courseModule) => courseModule.videos.map((lesson) => ({ ...lesson, module: { id: courseModule.id, title: courseModule.title, order: courseModule.order } })));
  const lessons = rawLessons.map(({ practices, ...lesson }, index) => ({
    ...lesson,
    practices: toLearnerPractices(practices),
    prerequisitePracticeIds: user.role === "ADMIN" ? [] : (rawLessons[index - 1]?.practices.map((practice) => practice.id) ?? []),
  }));

  return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-6xl px-4 py-10 sm:px-0 sm:py-12"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" />{t("backToDashboard")}</Link><section className="mt-8"><div className="flex items-center gap-2 text-accent"><GraduationCap className="h-5 w-5" /><span className="text-sm font-medium">{t("eyebrow")}</span></div><h1 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">{course.title}</h1><p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-muted">{t("unlockDescription")}</p></section><div className="mt-8"><LocalLessonPlayer lessons={lessons} completedPracticeIds={practiceResults.map((result) => result.practiceId)} /></div></main></div>;
}
