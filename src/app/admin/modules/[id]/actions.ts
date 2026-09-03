"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureAdmin() {
  if (!await getCurrentAdmin()) throw new Error("Unauthorized");
}

function positiveNumber(value: FormDataEntryValue | null, field: string) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`${field} must be a positive number.`);
  return number;
}

function optionalPrice(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== "string" || !value.trim()) return null;
  return positiveNumber(value, field);
}

export async function updateModule(moduleId: string, courseId: string, formData: FormData) {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Module title is required.");

  await prisma.module.update({
    where: { id: moduleId },
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      previewImage: String(formData.get("previewImage") ?? "").trim() || null,
      price: positiveNumber(formData.get("price"), "Price"),
      oldPrice: optionalPrice(formData.get("oldPrice"), "Old price"),
    },
  });

  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath(`/admin/courses/${courseId}/content`);
  revalidateTag("courses", { expire: 0 });
}

export async function createVideo(moduleId: string, courseId: string, formData: FormData) {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const storageKey = String(formData.get("storageKey") ?? "").trim();
  if (!title || !storageKey) throw new Error("Video title and storage key are required.");

  const previous = await prisma.video.findFirst({ where: { moduleId }, orderBy: { order: "desc" } });
  await prisma.video.create({
    data: {
      title,
      storageKey,
      description: String(formData.get("description") ?? "").trim() || null,
      previewImage: String(formData.get("previewImage") ?? "").trim() || null,
      duration: positiveNumber(formData.get("duration"), "Duration"),
      price: positiveNumber(formData.get("price"), "Price"),
      oldPrice: optionalPrice(formData.get("oldPrice"), "Old price"),
      isFreePreview: formData.get("isFreePreview") === "on",
      order: (previous?.order ?? 0) + 1,
      moduleId,
    },
  });

  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath(`/admin/courses/${courseId}/content`);
  revalidateTag("courses", { expire: 0 });
}

export async function updateVideo(videoId: string, moduleId: string, courseId: string, formData: FormData) {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const storageKey = String(formData.get("storageKey") ?? "").trim();
  if (!title || !storageKey) throw new Error("Video title and storage key are required.");

  await prisma.video.update({
    where: { id: videoId },
    data: {
      title,
      storageKey,
      description: String(formData.get("description") ?? "").trim() || null,
      previewImage: String(formData.get("previewImage") ?? "").trim() || null,
      duration: positiveNumber(formData.get("duration"), "Duration"),
      price: positiveNumber(formData.get("price"), "Price"),
      oldPrice: optionalPrice(formData.get("oldPrice"), "Old price"),
      isFreePreview: formData.get("isFreePreview") === "on",
    },
  });

  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath(`/admin/courses/${courseId}/content`);
  revalidateTag("courses", { expire: 0 });
}

export async function deleteVideo(videoId: string, moduleId: string, courseId: string) {
  await ensureAdmin();
  await prisma.video.update({ where: { id: videoId }, data: { deletedAt: new Date() } });
  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath(`/admin/courses/${courseId}/content`);
  revalidateTag("courses", { expire: 0 });
}

export async function moveVideo(videoId: string, moduleId: string, courseId: string, direction: "up" | "down") {
  await ensureAdmin();
  const videos = await prisma.video.findMany({ where: { moduleId, deletedAt: null }, orderBy: { order: "asc" }, select: { id: true, order: true } });
  const index = videos.findIndex((video) => video.id === videoId);
  const neighbor = videos[index + (direction === "up" ? -1 : 1)];
  if (index < 0 || !neighbor) return;
  await prisma.$transaction([
    prisma.video.update({ where: { id: videoId }, data: { order: neighbor.order } }),
    prisma.video.update({ where: { id: neighbor.id }, data: { order: videos[index].order } }),
  ]);
  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath(`/admin/courses/${courseId}/content`);
  revalidateTag("courses", { expire: 0 });
}
