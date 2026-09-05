import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CreateBook } from "./CreateBook";
import { deleteBook } from "./actions";
import { PriceTag } from "@/components/ui/PriceTag";

export default async function BooksAdminPage() {
  const books = await prisma.book.findMany({ where: { deletedAt: null }, select: { id: true, title: true, author: true, description: true, price: true, oldPrice: true, status: true, storageKey: true, coverImageKey: true }, orderBy: { createdAt: "desc" } });
  return <div className="space-y-8"><div className="flex items-end justify-between gap-4"><div><p className="text-sm text-foreground-subtle">Digital shop</p><h1 className="mt-1 font-serif text-4xl">Books</h1><p className="mt-3 text-foreground-muted">Create sellable, access-controlled PDF books.</p></div><span className="rounded-full bg-card px-3 py-1 text-sm text-foreground-muted">{books.length} total</span></div>
    <details className="group rounded-2xl border border-border bg-card p-5" open={books.length === 0}><summary className="cursor-pointer list-none font-semibold">+ Add book</summary><CreateBook /></details>
    <div className="grid gap-4">{books.map((book) => <article key={book.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-3"><h2 className="text-xl font-semibold">{book.title}</h2><span className="rounded-full bg-background px-2.5 py-1 text-xs text-foreground-muted">{book.status.toLowerCase()}</span></div><p className="mt-2 flex items-center gap-2 text-sm text-foreground-muted">{book.author} · <PriceTag price={book.price} oldPrice={book.oldPrice} /></p><p className="mt-3 max-w-2xl text-sm text-foreground-muted">{book.description}</p><p className="mt-3 text-xs text-foreground-subtle">{book.coverImageKey ? "Cover uploaded" : "No cover"} · {book.storageKey ? "Protected PDF uploaded" : "No PDF"}</p></div><div className="flex gap-2"><Link href={`/admin/books/${book.id}`} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"><Pencil className="h-4 w-4" />Edit</Link><form action={deleteBook.bind(null, book.id)}><AdminSubmitButton pendingLabel="Deleting…" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete</AdminSubmitButton></form></div></div></article>)}</div>
  </div>;
}
