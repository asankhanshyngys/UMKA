/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowUpRight, Layers3, PlayCircle } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import type { CatalogCourse } from "@/features/catalog/types";
import { currency } from "@/data/mockData";
import type { Locale } from "@/i18n/routing";
import { ModuleCarousel } from "./ModuleCarousel";

const thumbnailColors = ["bg-thumbnail-mustard", "bg-thumbnail-sage", "bg-thumbnail-forest"] as const;

const localeMap: Record<Locale, string> = {
  en: "en-US",
  ru: "ru-RU",
  kz: "kk-KZ",
};

interface TopicCardProps {
  course: CatalogCourse;
}

export async function TopicCard({ course }: TopicCardProps) {
  const t = await getTranslations("common");
  const locale = (await getLocale()) as Locale;

  return (
    <article className="grid overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-[minmax(250px,0.85fr)_minmax(0,2.15fr)]">
      <div className="flex min-h-72 flex-col bg-background p-7">
        <p className="text-xs font-medium uppercase tracking-label text-foreground-subtle">Course collection</p>
        <h3 className="mt-4 font-serif text-3xl leading-tight text-foreground">{course.title}</h3>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground-muted">{course.description}</p>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-5 text-sm">
          <span className="text-foreground-muted">{course.modules.length} modules</span>
          <Link href={`/courses/${course.id}`} className="font-semibold text-accent hover:text-accent-light">
            View course <ArrowUpRight className="inline h-4 w-4" />
          </Link>
        </div>
      </div>

      <ModuleCarousel>
        {course.modules.map((module, index) => (
          <Link key={module.id} href={`/courses/${course.id}`} className="group w-[calc((100vw-68px)/2)] shrink-0 snap-start rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-accent/40 sm:w-[calc((100vw-112px)/2)] lg:w-[260px]">
            {module.previewImage ? <img src={module.previewImage} alt={`Preview for ${module.title}`} className="aspect-[16/9] w-full rounded-xl object-cover" /> : <div className={`flex aspect-[16/9] items-end rounded-xl p-4 ${thumbnailColors[index % thumbnailColors.length]}`}><Layers3 className="h-6 w-6 text-white/90" /></div>}
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-foreground-subtle">Module {String(module.order).padStart(2, "0")}</p>
            <h4 className="mt-1 text-base font-semibold text-foreground">{module.title}</h4>
            {module.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground-muted">{module.description}</p>}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="flex items-center gap-1 text-foreground-muted"><PlayCircle className="h-4 w-4" /> {module.videos.length} {t("videos")}</span>
              <span className="font-semibold text-foreground">{module.price.toLocaleString(localeMap[locale])} {currency}</span>
            </div>
          </Link>
        ))}
      </ModuleCarousel>
    </article>
  );
}
