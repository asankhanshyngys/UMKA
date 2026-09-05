import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { deleteModule, moveModule } from "./actions";

export default function ModuleActions({ moduleId, courseId, isFirst, isLast }: { moduleId: string; courseId: string; isFirst: boolean; isLast: boolean }) {
  return (
    <form action={deleteModule.bind(null, moduleId, courseId)} className="flex items-center gap-2">
      <AdminSubmitButton pendingLabel="…" aria-label="Переместить модуль вверх" disabled={isFirst} formAction={moveModule.bind(null, moduleId, courseId, "up")} className="min-h-11 min-w-11 rounded-lg px-3 py-2 text-sm text-foreground-muted disabled:opacity-30">↑</AdminSubmitButton>
      <AdminSubmitButton pendingLabel="…" aria-label="Переместить модуль вниз" disabled={isLast} formAction={moveModule.bind(null, moduleId, courseId, "down")} className="min-h-11 min-w-11 rounded-lg px-3 py-2 text-sm text-foreground-muted disabled:opacity-30">↓</AdminSubmitButton>
      <AdminSubmitButton pendingLabel="Удаляю…" className="min-h-11 rounded-lg px-4 py-2 text-sm text-red-700 hover:bg-red-50">Удалить</AdminSubmitButton>
    </form>
  );
}
