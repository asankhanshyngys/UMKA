import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { WhatsAppCheckoutButton } from "@/features/checkout/WhatsAppCheckoutButton";

export function BookReader({ bookId, title, hasAccess }: { bookId: string; title: string; hasAccess: boolean }) {
  const t = useTranslations("bookDetail");
  if (!hasAccess) return <section className="mt-8 rounded-2xl border border-border bg-card p-6 text-center"><BookOpen className="mx-auto h-8 w-8 text-accent" /><h2 className="mt-3 font-serif text-2xl text-foreground">{t("readAfterPurchase")}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground-muted">{t("purchaseCopyWatermarked")}</p><WhatsAppCheckoutButton target={{ type: "book", bookId }} className="mx-auto mt-5 max-w-xs" /></section>;
  return <section className="mt-8"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-foreground-muted">{t("viewingCopyWatermarked")}</p><a href={`/api/books/${bookId}/read`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-card">{t("openReader")}</a></div><iframe title={title} src={`/api/books/${bookId}/read`} className="h-[75vh] w-full rounded-2xl border border-border bg-card" /></section>;
}
