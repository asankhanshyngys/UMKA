import { assertDatabaseConfigured, prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getPublishedCourses = unstable_cache(async () => {
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
          previewImage: true,
          price: true,
          order: true,
          videos: { where: { deletedAt: null }, select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}, ["published-courses"], { tags: ["courses"], revalidate: 300 });
