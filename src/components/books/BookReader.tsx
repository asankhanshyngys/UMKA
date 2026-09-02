import { BookOpen } from "lucide-react";
import { WhatsAppCheckoutButton } from "@/features/checkout/WhatsAppCheckoutButton";

export function BookReader({ bookId, title, hasAccess }: { bookId: string; title: string; hasAccess: boolean }) {
  if (!hasAccess) return <section className="mt-8 rounded-2xl border border-border bg-card p-6 text-center"><BookOpen className="mx-auto h-8 w-8 text-accent" /><h2 className="mt-3 font-serif text-2xl text-foreground">Read after purchase</h2><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground-muted">Your copy will be watermarked with your account details. This helps trace accidental sharing; it cannot prevent all copying.</p><WhatsAppCheckoutButton target={{ type: "book", bookId }} className="mx-auto mt-5 max-w-xs" /></section>;
  return <section className="mt-8"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-foreground-muted">This viewing copy is watermarked with your account details.</p><a href={`/api/books/${bookId}/read`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-card">Open reader</a></div><iframe title={title} src={`/api/books/${bookId}/read`} className="h-[75vh] w-full rounded-2xl border border-border bg-card" /></section>;
}
