import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateBook } from "../actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book || book.deletedAt) notFound();

  return <div><p className="text-sm text-foreground-subtle">Digital shop</p><h1 className="mt-1 font-serif text-4xl">Edit book</h1><form action={updateBook.bind(null, book.id)} encType="multipart/form-data" className="mt-8 grid max-w-2xl gap-4 md:grid-cols-2">
    <label className="text-sm">Title<input required name="title" defaultValue={book.title} className="mt-1 w-full rounded-lg border border-border bg-card p-3" /></label>
    <label className="text-sm">Author<input required name="author" defaultValue={book.author} className="mt-1 w-full rounded-lg border border-border bg-card p-3" /></label>
    <label className="text-sm">Price, ₸<input required min="0" name="price" type="number" defaultValue={book.price} className="mt-1 w-full rounded-lg border border-border bg-card p-3" /></label>
    <label className="text-sm">Status<select name="status" defaultValue={book.status} className="mt-1 w-full rounded-lg border border-border bg-card p-3"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></label>
    <label className="text-sm md:col-span-2">Description<textarea required name="description" defaultValue={book.description} className="mt-1 min-h-28 w-full rounded-lg border border-border bg-card p-3" /></label>
    <div className="md:col-span-2"><span className="text-sm">Cover image</span><ImageUploadField name="coverImageKey" defaultValue={book.coverImageKey} label="Book cover" /></div>
    <label className="text-sm md:col-span-2">Replace protected PDF (25 MB max)<input name="pdf" type="file" accept="application/pdf" className="mt-1 block w-full text-sm" /></label>
    <p className="text-sm text-foreground-muted md:col-span-2">The existing protected PDF remains in use until you upload a replacement.</p>
    <button className="w-fit rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white">Save book</button>
  </form></div>;
}
