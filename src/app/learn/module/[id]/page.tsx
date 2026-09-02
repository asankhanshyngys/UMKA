import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LocalLessonPlayer } from "@/components/course/LocalLessonPlayer";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toLearnerPractices } from "@/lib/practice-presentation";

export const dynamic = "force-dynamic";

export default async function LearnModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const now = new Date();
  const [courseModule, subscription, coursePurchase, modulePurchase, practiceResults] = await Promise.all([
    prisma.module.findFirst({ where: { id, deletedAt: null, course: { status: "PUBLISHED", deletedAt: null } }, include: { course: true, videos: { where: { deletedAt: null }, orderBy: { order: "asc" }, include: { practices: { include: { sections: { orderBy: { order: "asc" }, include: { questions: { include: { answers: true } } } } } } } } } }),
    user.role === "ADMIN" ? null : prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: now } } }),
    user.role === "ADMIN" ? [] : prisma.coursePurchase.findMany({ where: { userId: user.id, status: "COMPLETED", expiresAt: { gt: now } }, select: { courseId: true } }),
    user.role === "ADMIN" ? null : prisma.modulePurchase.findFirst({ where: { userId: user.id, moduleId: id, status: "COMPLETED", expiresAt: { gt: now } } }),
    prisma.practiceResult.findMany({ where: { userId: user.id, completed: true, practice: { video: { moduleId: id } } }, select: { practiceId: true } }),
  ]);
  if (!courseModule) notFound();
  const hasCoursePurchase = coursePurchase.some((purchase) => purchase.courseId === courseModule.courseId);
  if (user.role !== "ADMIN" && !subscription && !hasCoursePurchase && !modulePurchase) redirect(`/courses/${courseModule.courseId}`);

  const lessons = courseModule.videos.map(({ practices, ...lesson }, index) => ({ ...lesson, practices: toLearnerPractices(practices), prerequisitePracticeIds: user.role === "ADMIN" ? [] : (courseModule.videos[index - 1]?.practices.map((practice) => practice.id) ?? []) }));
  return <div className="min-h-screen bg-background"><Header /><main className="px-4 sm:px-6 lg:px-12 xl:px-20 py-10 "><Link href="/dashboard" className="text-sm text-foreground-muted hover:text-foreground">← My learning</Link><p className="mt-6 text-sm text-foreground-subtle">Module · {courseModule.course.title}</p><h1 className="mt-1 font-serif text-4xl">{courseModule.title}</h1><p className="mt-3 text-foreground-muted">Complete each lesson practice to unlock the next lesson in this module.</p><div className="mt-8"><LocalLessonPlayer lessons={lessons} completedPracticeIds={practiceResults.map((result) => result.practiceId)} /></div></main></div>;
}
