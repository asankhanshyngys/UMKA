import { assertDatabaseConfigured, prisma } from "@/lib/prisma";

export function getPublishedCourses() {
  assertDatabaseConfigured();
  return prisma.course.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      difficulty: true,
      thumbnail: true,
      modules: { select: { id: true, videos: { select: { id: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}
