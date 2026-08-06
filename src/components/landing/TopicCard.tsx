import Link from "next/link";
import type { CatalogCourse } from "@/features/catalog/types";

const thumbnailColors = {
  mustard: "bg-thumbnail-mustard",
  sage: "bg-thumbnail-sage",
  forest: "bg-thumbnail-forest",
} as const;

interface TopicCardProps { course: CatalogCourse; }

export function TopicCard({ course }: TopicCardProps) {
  const videoCount = course.modules.reduce((total, module) => total + module.videos.length, 0);
  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <article className="overflow-hidden rounded-2xl bg-card transition-transform group-hover:-translate-y-0.5">
        <div
          className={`aspect-[4/3] rounded-2xl ${thumbnailColors.mustard}`}
        />
        <div className="px-1 py-4">
          <h3 className="text-sm font-semibold text-foreground">{course.title}</h3>
          <p className="mt-1 text-xs text-foreground-subtle">
            {videoCount} видео · {course.price.toLocaleString("ru-RU")} ₸ · {course.difficulty.replaceAll("_", " ")}
          </p>
        </div>
      </article>
    </Link>
  );
}
