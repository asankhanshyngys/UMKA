import { prisma } from "@/lib/prisma";

type BookUser = { id: string; role: "USER" | "ADMIN" } | null;

/** Books are deliberately not included with video subscriptions. */
export async function canReadBook(user: BookUser, bookId: string) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;

  return Boolean(await prisma.bookPurchase.findFirst({
    where: { userId: user.id, bookId, status: "COMPLETED" },
    select: { id: true },
  }));
}
