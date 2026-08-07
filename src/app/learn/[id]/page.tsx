import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { LocalLessonPlayer } from "@/components/course/LocalLessonPlayer";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toLearnerPractices } from "@/lib/practice-presentation";

export const dynamic = "force-dynamic";

export default async function LearnCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
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
    ...lesson, practices: toLearnerPractices(practices),
    prerequisitePracticeIds: user.role === "ADMIN" ? [] : (rawLessons[index - 1]?.practices.map((practice) => practice.id) ?? []),
  }));

  return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-6xl px-6 py-10"><Link href="/dashboard" className="text-sm text-foreground-muted hover:text-foreground">← My courses</Link><p className="mt-6 text-sm text-foreground-subtle">Course</p><h1 className="mt-1 font-serif text-4xl">{course.title}</h1><p className="mt-3 text-foreground-muted">Complete each lesson&apos;s practice to unlock the next lesson.</p><div className="mt-8"><LocalLessonPlayer lessons={lessons} completedPracticeIds={practiceResults.map((result) => result.practiceId)} /></div></main></div>;
}
