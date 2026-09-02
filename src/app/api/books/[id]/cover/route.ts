import { NextResponse } from "next/server";
import { getBookObject } from "@/lib/book-storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await prisma.book.findFirst({ where: { id, status: "PUBLISHED", deletedAt: null, coverImageKey: { not: null } }, select: { coverImageKey: true } });
  if (!book?.coverImageKey) return new NextResponse(null, { status: 404 });
  if (/^https?:\/\//i.test(book.coverImageKey)) return NextResponse.redirect(book.coverImageKey);
  try {
    const cover = await getBookObject(book.coverImageKey);
    return new NextResponse(new Blob([new Uint8Array(cover.bytes)]), { headers: { "Content-Type": cover.contentType ?? "image/jpeg", "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
