import { NextResponse } from "next/server";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getCurrentUser } from "@/lib/auth";
import { canReadBook } from "@/lib/book-access";
import { getBookObject } from "@/lib/book-storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function watermarkText(name: string, email: string) {
  // Standard PDF fonts use WinAnsi. Email remains a reliable audit identifier
  // when a customer's display name contains unsupported characters.
  const printableName = name.replace(/[^\x20-\x7e]/g, "?");
  return `${printableName} · ${email} · issued ${new Date().toISOString().slice(0, 10)}`;
}

async function stampedPdf(bytes: Uint8Array, name: string, email: string) {
  const document = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await document.embedFont(StandardFonts.Helvetica);
  const text = watermarkText(name, email);
  for (const page of document.getPages()) {
    const { width, height } = page.getSize();
    const size = Math.max(10, Math.min(width, height) / 28);
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y: height / 2, size, font, color: rgb(0.35, 0.35, 0.35), opacity: 0.24, rotate: degrees(35) });
  }
  return document.save();
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  const book = await prisma.book.findFirst({ where: { id, deletedAt: null }, select: { id: true, storageKey: true } });
  if (!book) return NextResponse.json({ error: "Book not found." }, { status: 404 });
  if (!await canReadBook(user, book.id)) return NextResponse.json({ error: "A completed book purchase is required." }, { status: 403 });

  try {
    const original = await getBookObject(book.storageKey);
    const pdf = await stampedPdf(original.bytes, user.name, user.email);
    return new NextResponse(new Blob([new Uint8Array(pdf)]), { headers: { "Content-Type": "application/pdf", "Content-Disposition": "inline", "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "frame-ancestors 'self'" } });
  } catch (error) {
    console.error("Secure book delivery failed", error);
    return NextResponse.json({ error: "Unable to prepare the protected book." }, { status: 503 });
  }
}
