"use client";

import { createModule } from "./actions";

export default function CreateModule({ courseId }: { courseId: string }) {
  return <form action={createModule.bind(null, courseId)} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><input required name="title" placeholder="Название модуля" className="rounded-lg border border-border p-3" /><input required name="price" type="number" min="0" placeholder="Стоимость, ₸" className="rounded-lg border border-border p-3" /><button className="rounded-lg bg-accent px-4 py-3 text-sm text-white">Добавить</button><textarea name="description" placeholder="Короткое описание модуля" className="min-h-20 rounded-lg border border-border p-3 md:col-span-3" /></form>;
}
