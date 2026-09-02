import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { getPlatformSettings } from "@/lib/platform-settings";

export async function Hero() {
  const [t, settings] = await Promise.all([
    getTranslations("hero"),
    getPlatformSettings(),
  ]);

  return (
    <section className="px-4 pb-20 pt-8 sm:px-6 lg:px-12 xl:px-20">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="min-w-0 space-y-8">
          <p className="text-xs font-medium uppercase tracking-label text-foreground-subtle">
            {t("eyebrow")}
          </p>

          <h1 className="max-w-[14ch] font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
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
          {settings?.heroImageUrl && <Image src={settings.heroImageUrl} alt="" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />}
          {settings?.heroVideoUrl && (
            <a
              href={settings.heroVideoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t("playVideo")}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-transform hover:scale-105"><Play className="ml-1 h-8 w-8 fill-white text-white" /></span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
