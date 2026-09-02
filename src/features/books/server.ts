import { assertDatabaseConfigured, prisma } from "@/lib/prisma";

export type CatalogBook = {
  id: string;
  title: string;
  description: string;
  author: string;
  coverImageKey: string | null;
  price: number;
};

export async function getPublishedBooks(): Promise<CatalogBook[]> {
  assertDatabaseConfigured();
  try {
    return await prisma.book.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { id: true, title: true, description: true, author: true, coverImageKey: true, price: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    // The course storefront should remain usable while a deployment is waiting
    // for the books migration to be applied.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2021") {
      return [];
    }
    throw error;
  }
}
