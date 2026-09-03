import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BookReader } from "@/components/books/BookReader";
import { getCurrentUser } from "@/lib/auth";
import { canReadBook } from "@/lib/book-access";
import { prisma } from "@/lib/prisma";
import { getBookCoverUrl } from "@/lib/book-cover";
import { PriceTag } from "@/components/ui/PriceTag";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, user] = await Promise.all([prisma.book.findFirst({ where: { id, status: "PUBLISHED", deletedAt: null }, select: { id: true, title: true, description: true, author: true, coverImageKey: true, price: true, oldPrice: true } }), getCurrentUser()]);
  if (!book) notFound();
  const hasAccess = await canReadBook(user, book.id);
  return <div className="min-h-screen bg-background"><Header /><main className="main-with-mobile-nav px-4 py-14 sm:px-6 lg:px-12 xl:px-20"><div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]"><div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-card">{getBookCoverUrl(book) && <Image src={getBookCoverUrl(book)!} alt={`Cover of ${book.title}`} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />}</div><div className="flex flex-col justify-center"><p className="text-xs font-medium uppercase tracking-label text-foreground-subtle">Digital book · {book.author}</p><h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl">{book.title}</h1><p className="mt-6 max-w-xl text-base leading-relaxed text-foreground-muted">{book.description}</p><PriceTag price={book.price} oldPrice={book.oldPrice} className="mt-8 font-serif text-3xl" /><p className="mt-4 text-sm text-foreground-muted">Permanent access after purchase. Your reading copy is watermarked to help trace accidental sharing; no PDF protection can prevent all copying.</p></div></div><BookReader bookId={book.id} title={book.title} hasAccess={hasAccess} /></main></div>;
}
