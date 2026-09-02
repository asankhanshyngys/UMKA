import Link from "next/link";
import { Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-0">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <p className="text-xs font-medium uppercase tracking-label text-foreground-subtle">
            {t("eyebrow")}
          </p>

          <h1 className="font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
            {t("title")}
          </h1>

          <p className="max-w-md text-base leading-relaxed text-foreground-muted">
            {t("description")}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="#catalog">
              <Button>{t("ctaSubscription")}</Button>
            </Link>
            <Link href="#catalog">
              <Button variant="secondary">{t("ctaTopics")}</Button>
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-accent">
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              aria-label={t("playVideo")}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-transform hover:scale-105"
            >
              <Play className="ml-1 h-8 w-8 fill-white text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
