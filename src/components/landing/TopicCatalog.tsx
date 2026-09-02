import { getTranslations } from "next-intl/server";
import type { CatalogCourse } from "@/features/catalog/types";
import { TopicCard } from "./TopicCard";

interface TopicCatalogProps {
  courses: CatalogCourse[];
}

export async function TopicCatalog({ courses }: TopicCatalogProps) {
  const t = await getTranslations("catalog");

  return (
    <section id="catalog" className="mx-auto max-w-6xl px-4 py-20 sm:px-0">
      <div className="mb-10 space-y-3">
        <p className="text-xs font-medium uppercase tracking-label text-foreground-subtle">
          {t("eyebrow")}
        </p>
        <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h2>
        <p className="max-w-xl text-base text-foreground-muted">{t("description")}</p>
      </div>

      <div className="space-y-8">
        {courses.map((course) => (
          <TopicCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
