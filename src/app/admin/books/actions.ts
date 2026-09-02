"use server";

import { CourseStatus } from "@/generated/prisma/client";
import { getCurrentAdmin } from "@/lib/auth";
import { uploadBookObject } from "@/lib/book-storage";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const MAX_PDF_SIZE = 25 * 1024 * 1024;
const MAX_COVER_SIZE = 5 * 1024 * 1024;

async function ensureAdmin() {
  if (!await getCurrentAdmin()) throw new Error("Unauthorized");
}

function requiredText(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string" || !value.trim()) throw new Error(`${name} is required.`);
  return value.trim();
}

function bookSlug(title: string) {
  const stem = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "book";
  return `${stem}-${crypto.randomUUID().slice(0, 8)}`;
}

async function uploadedFile(formData: FormData, name: string, maximumSize: number, allowed: readonly string[]) {
  const value = formData.get(name);
  if (!(value instanceof File) || value.size === 0) return null;
  if (value.size > maximumSize) throw new Error(`${name} is too large.`);
  if (!allowed.includes(value.type)) throw new Error(`${name} has an unsupported file type.`);
  return { name: value.name, type: value.type, bytes: new Uint8Array(await value.arrayBuffer()) };
}

async function uploadedPdf(formData: FormData, required = false) {
  const file = await uploadedFile(formData, "pdf", MAX_PDF_SIZE, ["application/pdf"]);
  if (!file && required) throw new Error("A PDF file is required.");
  return file ? uploadBookObject("pdf", file.name, file.bytes, file.type) : null;
}

async function uploadedCover(formData: FormData) {
  const file = await uploadedFile(formData, "cover", MAX_COVER_SIZE, ["image/jpeg", "image/png", "image/webp"]);
  return file ? uploadBookObject("cover", file.name, file.bytes, file.type) : null;
}

function statusFor(formData: FormData) {
  const status = formData.get("status");
  return status === "PUBLISHED" ? CourseStatus.PUBLISHED : status === "ARCHIVED" ? CourseStatus.ARCHIVED : CourseStatus.DRAFT;
}

function revalidateBookPaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath("/admin/books");
  if (id) {
    revalidatePath(`/books/${id}`);
    revalidatePath(`/admin/books/${id}`);
  }
}

export async function createBook(formData: FormData) {
  await ensureAdmin();
  const title = requiredText(formData, "title");
  const author = requiredText(formData, "author");
  const description = requiredText(formData, "description");
  const price = Number(formData.get("price"));
  if (!Number.isSafeInteger(price) || price < 0) throw new Error("Price must be a non-negative whole number.");
  const storageKey = await uploadedPdf(formData, true);
  const coverImageKey = await uploadedCover(formData);

  await prisma.book.create({ data: { title, slug: bookSlug(title), author, description, price, status: statusFor(formData), storageKey: storageKey!, coverImageKey } });
  revalidateBookPaths();
}

export async function updateBook(id: string, formData: FormData) {
  await ensureAdmin();
  const title = requiredText(formData, "title");
  const author = requiredText(formData, "author");
  const description = requiredText(formData, "description");
  const price = Number(formData.get("price"));
  if (!Number.isSafeInteger(price) || price < 0) throw new Error("Price must be a non-negative whole number.");
  const [storageKey, coverImageKey] = await Promise.all([uploadedPdf(formData), uploadedCover(formData)]);
  await prisma.book.update({ where: { id }, data: { title, author, description, price, status: statusFor(formData), ...(storageKey ? { storageKey } : {}), ...(coverImageKey ? { coverImageKey } : {}) } });
  revalidateBookPaths(id);
}

export async function deleteBook(id: string) {
  await ensureAdmin();
  await prisma.book.update({ where: { id }, data: { deletedAt: new Date(), status: CourseStatus.ARCHIVED } });
  revalidateBookPaths(id);
}
