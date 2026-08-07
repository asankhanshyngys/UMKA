"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureAdmin() {
  if (!await getCurrentAdmin()) throw new Error("Unauthorized");
}

export async function createTeacher(formData: FormData) {
  await ensureAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  if (!name) throw new Error("Teacher name is required.");
  await prisma.instructor.create({ data: { name, bio: bio || null } });
  revalidatePath("/admin/teachers");
  revalidatePath("/admin/courses");
}

export async function updateTeacher(id: string, formData: FormData) {
  await ensureAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  if (!name) throw new Error("Teacher name is required.");
  await prisma.instructor.update({ where: { id }, data: { name, bio: bio || null } });
  revalidatePath("/admin/teachers");
  revalidatePath("/admin/courses");
}

export async function deleteTeacher(id: string) {
  await ensureAdmin();
  const courseCount = await prisma.course.count({ where: { instructorId: id, deletedAt: null } });
  if (courseCount > 0) throw new Error("Reassign this teacher's courses before deleting them.");
  await prisma.instructor.delete({ where: { id } });
  revalidatePath("/admin/teachers");
  revalidatePath("/admin/courses");
}
