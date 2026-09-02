import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, books] = await Promise.all([
    prisma.course.findMany({ where: { status: "PUBLISHED", deletedAt: null }, select: { id: true, updatedAt: true, createdAt: true } }),
    prisma.book.findMany({ where: { status: "PUBLISHED", deletedAt: null }, select: { id: true, updatedAt: true, createdAt: true } }),
  ]);

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/books`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/login`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/register`, changeFrequency: "yearly", priority: 0.3 },
    ...courses.map((course) => ({ url: `${baseUrl}/courses/${course.id}`, lastModified: course.updatedAt ?? course.createdAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...books.map((book) => ({ url: `${baseUrl}/books/${book.id}`, lastModified: book.updatedAt ?? book.createdAt, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
