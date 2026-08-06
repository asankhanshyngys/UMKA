import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.course.findFirst({
    where: { id, status: "PUBLISHED", deletedAt: null },
    include: {
      instructor: true,
      modules: {
        where: { deletedAt: null },
        orderBy: { order: "asc" },
        include: { videos: { where: { deletedAt: null }, orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) notFound();

  const lessonCount = course.modules.reduce((total, module) => total + module.videos.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm text-foreground-subtle">{course.difficulty.replaceAll("_", " ")} · {lessonCount} уроков</p>
        <h1 className="mt-3 font-serif text-4xl text-foreground">{course.title}</h1>
        <p className="mt-5 max-w-2xl text-foreground-muted">{course.description}</p>
        <p className="mt-6 text-lg font-semibold text-foreground">{course.price.toLocaleString("ru-RU")} ₸</p>
        <p className="mt-2 text-sm text-foreground-subtle">Преподаватель: {course.instructor.name}</p>

        <section className="mt-12 space-y-4">
          <h2 className="font-serif text-2xl text-foreground">Программа курса</h2>
          {course.modules.map((module) => (
            <article key={module.id} className="rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground">{module.order}. {module.title}</h3>
              {module.description && <p className="mt-2 text-sm text-foreground-muted">{module.description}</p>}
              <p className="mt-3 text-sm text-foreground-subtle">{module.videos.length} уроков</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
