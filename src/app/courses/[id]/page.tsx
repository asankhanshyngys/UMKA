import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { TestCheckoutButton } from "@/features/checkout/TestCheckoutButton";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [course, user] = await Promise.all([
    prisma.course.findFirst({ where: { id, status: "PUBLISHED", deletedAt: null }, include: { instructor: true, modules: { where: { deletedAt: null }, orderBy: { order: "asc" }, include: { videos: { where: { deletedAt: null }, orderBy: { order: "asc" } } } } } }),
    getCurrentUser(),
  ]);
  if (!course) notFound();
  const now = new Date();
  const [subscription, coursePurchase, modulePurchases, videoPurchases] = user && user.role !== "ADMIN" ? await Promise.all([
    prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: now } } }),
    prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: course.id, status: "COMPLETED", expiresAt: { gt: now } } }),
    prisma.modulePurchase.findMany({ where: { userId: user.id, status: "COMPLETED", expiresAt: { gt: now }, module: { courseId: course.id } }, select: { moduleId: true } }),
    prisma.videoPurchase.findMany({ where: { userId: user.id, status: "COMPLETED", expiresAt: { gt: now }, video: { module: { courseId: course.id } } }, select: { videoId: true } }),
  ]) : [null, null, [], []];
  const hasFullAccess = user?.role === "ADMIN" || Boolean(subscription) || Boolean(coursePurchase);
  const purchasedModuleIds = new Set(modulePurchases.map((purchase) => purchase.moduleId));
  const purchasedVideoIds = new Set(videoPurchases.map((purchase) => purchase.videoId));
  const lessonCount = course.modules.reduce((total, courseModule) => total + courseModule.videos.length, 0);

  return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-4xl px-6 py-12">
    <p className="text-sm text-foreground-subtle">{course.difficulty.replaceAll("_", " ")} · {lessonCount} lessons</p><h1 className="mt-3 font-serif text-4xl text-foreground">{course.title}</h1><p className="mt-5 max-w-2xl text-foreground-muted">{course.description}</p><p className="mt-6 text-lg font-semibold text-foreground">Full course: {course.price.toLocaleString("ru-RU")} ₸</p><p className="mt-2 text-sm text-foreground-subtle">Instructor: {course.instructor.name}</p>
    {hasFullAccess ? <div className="mt-6"><p className="text-sm font-medium text-green-700 dark:text-green-400">You already have full access to this course.</p><Link href={`/learn/${course.id}`} className="mt-2 inline-block text-sm text-accent underline">Open full course</Link></div> : <><TestCheckoutButton target={{ type: "course", courseId: course.id }} className="mt-6 max-w-xs" /><Link href={`/learn/${course.id}`} className="mt-3 inline-block text-sm text-accent underline">Open full course</Link></>}
    <section className="mt-12 space-y-4"><div><h2 className="font-serif text-2xl text-foreground">Course lessons</h2><p className="mt-2 text-sm text-foreground-muted">Choose the whole course, one module, or an individual lesson with practice.</p></div>
      {course.modules.map((courseModule) => { const hasModuleAccess = hasFullAccess || purchasedModuleIds.has(courseModule.id); return <article key={courseModule.id} className="rounded-xl border border-border p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="font-semibold text-foreground">{courseModule.order}. {courseModule.title}</h3>{courseModule.description && <p className="mt-2 text-sm text-foreground-muted">{courseModule.description}</p>}<p className="mt-2 text-sm font-medium text-foreground">Module: {courseModule.price.toLocaleString("ru-RU")} ₸</p></div>{hasFullAccess ? <span className="text-sm font-medium text-green-700 dark:text-green-400">Included in your full access</span> : purchasedModuleIds.has(courseModule.id) ? <Link href={`/learn/module/${courseModule.id}`} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground">Open module</Link> : <TestCheckoutButton target={{ type: "module", moduleId: courseModule.id }} className="w-48" />}</div><div className="mt-4 grid gap-3">{courseModule.videos.map((video) => <div key={video.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-card p-4"><div><p className="font-medium text-foreground">{video.title}</p><p className="mt-1 text-sm text-foreground-subtle">{Math.ceil(video.duration / 60)} min · {video.price.toLocaleString("ru-RU")} ₸ · includes practice</p></div>{hasModuleAccess ? <span className="text-sm font-medium text-green-700 dark:text-green-400">Included in your access</span> : purchasedVideoIds.has(video.id) ? <Link href={`/learn/video/${video.id}`} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground">Open lesson</Link> : <TestCheckoutButton target={{ type: "video", videoId: video.id }} className="w-48" />}</div>)}</div></article>; })}
    </section>
  </main></div>;
}
