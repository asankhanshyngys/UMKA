import { createBook } from "./actions";

export function CreateBook() {
  return (
    <form action={createBook} encType="multipart/form-data" className="mt-5 grid gap-4 md:grid-cols-2">
      <label className="text-sm">Title<input required name="title" className="mt-1 w-full rounded-lg border border-border bg-card p-3" /></label>
      <label className="text-sm">Author<input required name="author" className="mt-1 w-full rounded-lg border border-border bg-card p-3" /></label>
      <label className="text-sm">Price, ₸<input required min="0" name="price" type="number" className="mt-1 w-full rounded-lg border border-border bg-card p-3" /></label>
      <label className="text-sm">Status<select name="status" className="mt-1 w-full rounded-lg border border-border bg-card p-3"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></label>
      <label className="text-sm md:col-span-2">Description<textarea required name="description" className="mt-1 min-h-24 w-full rounded-lg border border-border bg-card p-3" /></label>
      <label className="text-sm md:col-span-2">Cover image (JPG, PNG or WebP; 5 MB max)<input required name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full text-sm" /></label>
      <label className="text-sm md:col-span-2">Protected PDF (25 MB max)<input required name="pdf" type="file" accept="application/pdf" className="mt-1 block w-full text-sm" /></label>
      <p className="text-sm text-foreground-muted md:col-span-2">The original files are stored in a private R2 bucket. Buyers receive a fresh, watermarked PDF viewer copy after access is confirmed.</p>
      <button className="w-fit rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white">Create book</button>
    </form>
  );
}
