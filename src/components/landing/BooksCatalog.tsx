import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { CatalogBook } from "@/features/books/server";
import { getBookCoverUrl } from "@/lib/book-cover";
import { PriceTag } from "@/components/ui/PriceTag";

export function BooksCatalog({ books }: { books: CatalogBook[] }) {
  if (books.length === 0) return null;

  return <section id="books" className="px-4 py-20 sm:px-6 lg:px-12 xl:px-20"><div className="mb-10 space-y-3"><p className="text-xs font-medium uppercase tracking-label text-foreground-subtle">Digital library</p><h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">Books for independent study</h2><p className="max-w-xl text-base text-foreground-muted">Practical workbooks and guides to keep alongside your course modules.</p></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{books.map((book) => <Link key={book.id} href={`/books/${book.id}`} className="group"><Card className="h-full p-4 transition group-hover:-translate-y-0.5"><div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-background">{getBookCoverUrl(book) && <Image src={getBookCoverUrl(book)!} alt={`Cover of ${book.title}`} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />}</div><p className="mt-5 text-xs font-medium uppercase tracking-wide text-foreground-subtle">Digital book · {book.author}</p><h3 className="mt-1 text-lg font-semibold text-foreground">{book.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground-muted">{book.description}</p><div className="mt-5 flex items-center justify-between gap-2 border-t border-border pt-4 text-sm"><PriceTag price={book.price} oldPrice={book.oldPrice} /><span className="font-medium text-accent">View book <ArrowUpRight className="inline h-4 w-4" /></span></div></Card></Link>)}</div></section>;
}
