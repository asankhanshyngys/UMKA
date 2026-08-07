import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { CatalogCourse } from "@/features/catalog/types";
import { currency } from "@/data/mockData";
import type { Locale } from "@/i18n/routing";

const thumbnailColors = {
  mustard: "bg-thumbnail-mustard",
  sage: "bg-thumbnail-sage",
  forest: "bg-thumbnail-forest",
} as const;

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
  const videoCount = course.modules.reduce(
    (total, module) => total + module.videos.length,
    0,
  );

  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <article className="overflow-hidden rounded-2xl bg-card transition-transform group-hover:-translate-y-0.5">
        <div className={`aspect-[4/3] rounded-2xl ${thumbnailColors.mustard}`} />
        <div className="px-1 py-4">
          <h3 className="text-sm font-semibold text-foreground">{course.title}</h3>
          <p className="mt-1 text-xs text-foreground-subtle">
            {videoCount} {t("videos")} · {course.price.toLocaleString(localeMap[locale])} {currency} ·{" "}
            {course.difficulty.replaceAll("_", " ")}
          </p>
        </div>
      </article>
    </Link>
  );
}
