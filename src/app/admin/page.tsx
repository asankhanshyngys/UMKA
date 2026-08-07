import Link from "next/link";
import { BookOpen, Layers3, Users } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [admin, courseCount, moduleCount, learnerCount] = await Promise.all([
    getCurrentAdmin(),
    prisma.course.count({ where: { deletedAt: null } }),
    prisma.module.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: "USER" } }),
  ]);

  return (
    <div className="space-y-8">
      <div><p className="text-sm text-foreground-subtle">Добро пожаловать, {admin?.name}</p><h1 className="mt-1 font-serif text-4xl">Управление школой</h1><p className="mt-3 text-foreground-muted">Добавляйте курсы, собирайте уроки и следите за учебной платформой.</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[{ label: "Курсы", value: courseCount, icon: BookOpen }, { label: "Модули", value: moduleCount, icon: Layers3 }, { label: "Ученики", value: learnerCount, icon: Users }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-border bg-card p-5"><Icon className="h-5 w-5 text-accent" /><p className="mt-5 text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-foreground-muted">{label}</p></div>)}
      </div>
      <div className="rounded-2xl bg-accent p-7 text-white"><h2 className="font-serif text-2xl">Готовы добавить новый материал?</h2><p className="mt-2 max-w-xl text-sm text-white/75">Создайте курс, добавьте модули и наполните их видеоуроками — всё в одном рабочем потоке.</p><Link href="/admin/courses" className="mt-5 inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-accent">Открыть курсы</Link></div>
    </div>
  );
}
