import type { CatalogCourse } from "@/features/catalog/types";
import { TopicCard } from "./TopicCard";

interface TopicCatalogProps {
  courses: CatalogCourse[];
}

export function TopicCatalog({ courses }: TopicCatalogProps) {
  return (
    <section id="catalog" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 space-y-3">
        <p className="text-xs font-medium uppercase tracking-label text-foreground-subtle">
          Темы
        </p>
        <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Или купите отдельно
        </h2>
        <p className="max-w-xl text-base text-foreground-muted">
          Одну тему целиком или отдельный видеоролик — доступ на 1 месяц.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <TopicCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
