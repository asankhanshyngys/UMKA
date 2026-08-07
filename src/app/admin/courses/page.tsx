import Link from "next/link";
import { Layers3, Pencil, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CreateCourse from "./CreateCourse";
import { deleteCourse } from "./actions";

const statusLabel = { DRAFT: "Черновик", PUBLISHED: "Опубликован", ARCHIVED: "Архив" } as const;

export default async function CoursesPage() {
  const [courses, instructors, categories] = await Promise.all([
    prisma.course.findMany({ where: { deletedAt: null }, include: { instructor: true, category: true, modules: { where: { deletedAt: null } } }, orderBy: { createdAt: "desc" } }),
    prisma.instructor.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-foreground-subtle">Учебный каталог</p><h1 className="mt-1 font-serif text-4xl">Курсы</h1><p className="mt-3 text-foreground-muted">Создавайте курсы и переходите к их программе без ручного ввода адресов.</p></div><span className="rounded-full bg-card px-3 py-1 text-sm text-foreground-muted">{courses.length} всего</span></div>
      <details className="group rounded-2xl border border-border bg-card p-5" open={courses.length === 0}><summary className="cursor-pointer list-none font-semibold text-foreground"><span className="group-open:hidden">+ Добавить курс</span><span className="hidden group-open:inline">Добавление курса</span></summary><CreateCourse instructors={instructors} categories={categories} /></details>
      {courses.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-10 text-center text-foreground-muted">Курсов ещё нет. Создайте первый курс выше.</div> : <div className="grid gap-4">{courses.map((course) => <article key={course.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-3"><h2 className="text-xl font-semibold">{course.title}</h2><span className="rounded-full bg-background px-2.5 py-1 text-xs text-foreground-muted">{statusLabel[course.status]}</span></div><p className="mt-2 max-w-2xl text-sm text-foreground-muted">{course.description}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground-subtle"><span>{course.price.toLocaleString("ru-RU")} ₸</span><span>{course.instructor.name}</span><span>{course.modules.length} модулей</span></div></div><div className="flex flex-wrap gap-2"><Link href={`/admin/courses/${course.id}/content`} className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm text-white"><Layers3 className="h-4 w-4" />Программа</Link><Link href={`/admin/courses/${course.id}`} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"><Pencil className="h-4 w-4" />Изменить</Link><form action={deleteCourse.bind(null, course.id)}><button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Удалить</button></form></div></div></article>)}</div>}
    </div>
  );
}
