import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BookReader } from "@/components/books/BookReader";
import { getCurrentUser } from "@/lib/auth";
import { canReadBook } from "@/lib/book-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReadBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const book = await prisma.book.findFirst({ where: { id, deletedAt: null }, select: { id: true, title: true } });
  if (!book) notFound();
  if (!await canReadBook(user, book.id)) redirect(`/books/${book.id}`);
  return <div className="min-h-screen bg-background"><Header /><main className="main-with-mobile-nav px-4 py-8 sm:px-6 lg:px-12 xl:px-20"><p className="text-sm text-foreground-subtle">My library</p><h1 className="mt-1 font-serif text-3xl text-foreground">{book.title}</h1><BookReader bookId={book.id} title={book.title} hasAccess /></main></div>;
}
