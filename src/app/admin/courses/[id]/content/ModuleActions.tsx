"use client";

import { deleteModule, moveModule } from "./actions";

export default function ModuleActions({ moduleId, courseId, isFirst, isLast }: { moduleId: string; courseId: string; isFirst: boolean; isLast: boolean }) {
  return <div className="flex items-center gap-2"><button type="button" disabled={isFirst} onClick={() => moveModule(moduleId, courseId, "up")} className="min-h-11 min-w-11 rounded-lg px-3 py-2 text-sm text-foreground-muted disabled:opacity-30">↑</button><button type="button" disabled={isLast} onClick={() => moveModule(moduleId, courseId, "down")} className="min-h-11 min-w-11 rounded-lg px-3 py-2 text-sm text-foreground-muted disabled:opacity-30">↓</button><button type="button" onClick={() => deleteModule(moduleId, courseId)} className="min-h-11 rounded-lg px-4 py-2 text-sm text-red-700 hover:bg-red-50">Удалить</button></div>;
}
