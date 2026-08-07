import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LocalLessonPlayer } from "@/components/course/LocalLessonPlayer";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toLearnerPractices } from "@/lib/practice-presentation";

export const dynamic = "force-dynamic";

export default async function LearnVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const now = new Date();
  const [video, subscription, coursePurchases, modulePurchases, videoPurchase, practiceResults] = await Promise.all([
    prisma.video.findFirst({ where: { id, deletedAt: null, module: { deletedAt: null, course: { status: "PUBLISHED", deletedAt: null } } }, include: { module: { include: { course: true } }, practices: { include: { sections: { orderBy: { order: "asc" }, include: { questions: { include: { answers: true } } } } } } } }),
    user.role === "ADMIN" ? null : prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: now } } }),
    user.role === "ADMIN" ? [] : prisma.coursePurchase.findMany({ where: { userId: user.id, status: "COMPLETED", expiresAt: { gt: now } }, select: { courseId: true } }),
    user.role === "ADMIN" ? [] : prisma.modulePurchase.findMany({ where: { userId: user.id, status: "COMPLETED", expiresAt: { gt: now } }, select: { moduleId: true } }),
    user.role === "ADMIN" ? null : prisma.videoPurchase.findFirst({ where: { userId: user.id, videoId: id, status: "COMPLETED", expiresAt: { gt: now } } }),
    prisma.practiceResult.findMany({ where: { userId: user.id, completed: true, practice: { videoId: id } }, select: { practiceId: true } }),
  ]);
  if (!video) notFound();
  const hasCoursePurchase = coursePurchases.some((purchase) => purchase.courseId === video.module.courseId);
  const hasModulePurchase = modulePurchases.some((purchase) => purchase.moduleId === video.moduleId);
  if (user.role !== "ADMIN" && !subscription && !hasCoursePurchase && !hasModulePurchase && !videoPurchase) redirect(`/courses/${video.module.courseId}`);
  const { practices, ...lesson } = video;

  return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-6xl px-6 py-10"><Link href="/dashboard" className="text-sm text-foreground-muted hover:text-foreground">Back to my courses</Link><p className="mt-6 text-sm text-foreground-subtle">Standalone lesson · {video.module.course.title}</p><h1 className="mt-1 font-serif text-4xl">{video.title}</h1><p className="mt-3 text-foreground-muted">You have access to this lesson and its practice.</p><div className="mt-8"><LocalLessonPlayer lessons={[{ ...lesson, practices: toLearnerPractices(practices), prerequisitePracticeIds: [] }]} completedPracticeIds={practiceResults.map((result) => result.practiceId)} /></div></main></div>;
}
