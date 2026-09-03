import { assertDatabaseConfigured, prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export type CatalogBook = {
  id: string;
  title: string;
  description: string;
  author: string;
  coverImageKey: string | null;
  price: number;
  oldPrice: number | null;
};

const getCachedPublishedBooks = unstable_cache(
  async (): Promise<CatalogBook[]> => prisma.book.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    select: { id: true, title: true, description: true, author: true, coverImageKey: true, price: true, oldPrice: true },
    orderBy: { createdAt: "desc" },
  }),
  ["published-books"],
  { tags: [CACHE_TAGS.books], revalidate: 300 },
);

export async function getPublishedBooks(): Promise<CatalogBook[]> {
  assertDatabaseConfigured();
  try {
    return await getCachedPublishedBooks();
  } catch (error) {
    // The course storefront should remain usable while a deployment is waiting
    // for the books migration to be applied.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2021") {
      return [];
    }
    throw error;
  }
}
