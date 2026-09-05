"use client";

import { updateCourse } from "./actions";
import Link from "next/link";
import type { Course } from "@/generated/prisma/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";


export default function EditCourse({
                                       course,
                                   }: {
    course: Course
}){

    return <form action={updateCourse.bind(null, course.id)} className="mt-5 grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2">
        <label className="text-sm text-foreground">Название<input name="title" defaultValue={course.title} required className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-foreground" /></label>
        <label className="text-sm text-foreground md:col-span-2">Описание<textarea name="description" defaultValue={course.description} required className="mt-1 min-h-24 w-full rounded-lg border border-border bg-background p-3 text-foreground" /></label>
        <div className="md:col-span-2"><ImageUploadField name="thumbnail" defaultValue={course.thumbnail} label="Обложка курса" /></div>
        <label className="text-sm text-foreground">Стоимость, ₸<input name="price" type="number" min="0" defaultValue={course.price} required className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-foreground" /></label>
        <label className="text-sm text-foreground">Старая цена (для скидки, необязательно)<input name="oldPrice" type="number" min="0" defaultValue={course.oldPrice ?? ""} className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-foreground" /></label>
        <label className="text-sm text-foreground">Уровень<select name="difficulty" defaultValue={course.difficulty} className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-foreground"><option value="BEGINNER">Начинающий</option><option value="INTERMEDIATE">Средний</option><option value="ADVANCED">Продвинутый</option></select></label>
        <label className="text-sm text-foreground">Статус<select name="status" defaultValue={course.status} className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-foreground"><option value="DRAFT">Черновик</option><option value="PUBLISHED">Опубликован</option></select></label>
        <div className="flex flex-wrap gap-3 md:col-span-2"><AdminSubmitButton pendingLabel="Сохраняю изменения…" className="min-h-11 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white">Сохранить изменения</AdminSubmitButton><Link href={`/admin/courses/${course.id}/content`} className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-background">Управление содержимым</Link></div>
    </form>;

}
