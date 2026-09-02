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
      modules: {
        where: { deletedAt: null },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          order: true,
          videos: { where: { deletedAt: null }, select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
