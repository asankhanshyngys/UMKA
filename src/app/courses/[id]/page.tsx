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
    prisma.course.findFirst({
      where: { id, status: "PUBLISHED", deletedAt: null },
      include: { instructor: true, modules: { where: { deletedAt: null }, orderBy: { order: "asc" }, include: { videos: { where: { deletedAt: null }, orderBy: { order: "asc" } } } } },
    }),
    getCurrentUser(),
  ]);
  if (!course) notFound();

  const now = new Date();
  const [subscription, coursePurchase, modulePurchases] = user && user.role !== "ADMIN" ? await Promise.all([
    prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: now } } }),
    prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: course.id, status: "COMPLETED", expiresAt: { gt: now } } }),
    prisma.modulePurchase.findMany({ where: { userId: user.id, status: "COMPLETED", expiresAt: { gt: now }, module: { courseId: course.id } }, select: { moduleId: true } }),
  ]) : [null, null, []];
  const hasFullAccess = user?.role === "ADMIN" || Boolean(subscription) || Boolean(coursePurchase);
  const purchasedModuleIds = new Set(modulePurchases.map((purchase) => purchase.moduleId));
  const lessonCount = course.modules.reduce((total, courseModule) => total + courseModule.videos.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm uppercase tracking-label text-foreground-subtle">{course.difficulty.replaceAll("_", " ")} · {course.modules.length} modules · {lessonCount} lessons</p>
        <h1 className="mt-4 font-serif text-4xl text-foreground sm:text-5xl">{course.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground-muted">{course.description}</p>
        <p className="mt-6 text-sm text-foreground-subtle">Instructor: {course.instructor.name}</p>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:flex sm:items-center sm:justify-between">
          <div><p className="text-sm text-foreground-muted">Complete course</p><p className="mt-1 font-serif text-3xl text-foreground">{course.price.toLocaleString("ru-RU")} ₸</p></div>
          {hasFullAccess ? <Link href={`/learn/${course.id}`} className="mt-4 inline-block rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white sm:mt-0">Open full course</Link> : <TestCheckoutButton target={{ type: "course", courseId: course.id }} className="mt-4 w-full sm:mt-0 sm:w-52" />}
        </div>

        <section className="mt-14">
          <div className="mb-6"><p className="text-xs font-medium uppercase tracking-label text-foreground-subtle">Choose your path</p><h2 className="mt-2 font-serif text-3xl text-foreground">Course modules</h2><p className="mt-2 text-foreground-muted">Purchase a complete course or select the modules you need. Individual lessons are included with their module.</p></div>
          <div className="space-y-4">
            {course.modules.map((courseModule) => {
              const hasModuleAccess = hasFullAccess || purchasedModuleIds.has(courseModule.id);
              return <article key={courseModule.id} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div><p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">Module {String(courseModule.order).padStart(2, "0")} · {courseModule.videos.length} lessons</p><h3 className="mt-2 text-xl font-semibold text-foreground">{courseModule.title}</h3>{courseModule.description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-muted">{courseModule.description}</p>}</div>
                  <div className="min-w-44"><p className="text-lg font-semibold text-foreground">{courseModule.price.toLocaleString("ru-RU")} ₸</p>{hasModuleAccess ? <Link href={`/learn/module/${courseModule.id}`} className="mt-3 inline-block text-sm font-medium text-accent underline">Open module</Link> : <TestCheckoutButton target={{ type: "module", moduleId: courseModule.id }} className="mt-3" />}</div>
                </div>
                <ol className="mt-5 grid gap-2 border-t border-border pt-4 sm:grid-cols-2">
                  {courseModule.videos.map((video, index) => <li key={video.id} className="flex items-center gap-3 rounded-lg bg-background px-3 py-2 text-sm text-foreground-muted"><span className="text-foreground-subtle">{String(index + 1).padStart(2, "0")}</span><span>{video.title}</span></li>)}
                </ol>
              </article>;
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
