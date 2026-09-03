import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("footer");

  return <main className="main-with-mobile-nav px-4 py-14 sm:px-6 lg:px-12 xl:px-20"><section className="mx-auto max-w-3xl"><p className="text-sm text-foreground-subtle">UMKA English</p><h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">{t("about")}</h1><p className="mt-6 rounded-2xl border border-border bg-card p-6 text-base leading-relaxed text-foreground-muted">{t("aboutPlaceholder")}</p></section></main>;
}
