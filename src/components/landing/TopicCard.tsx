import Link from "next/link";
import type { Topic } from "@/types/course";
import { formatPrice } from "@/data/mockData";

const thumbnailColors = {
  mustard: "bg-thumbnail-mustard",
  sage: "bg-thumbnail-sage",
  forest: "bg-thumbnail-forest",
} as const;

interface TopicCardProps {
  topic: Topic;
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <Link href={`/topics/${topic.id}`} className="group block">
      <article className="overflow-hidden rounded-2xl bg-card transition-transform group-hover:-translate-y-0.5">
        <div
          className={`aspect-[4/3] rounded-2xl ${thumbnailColors[topic.thumbnailColor]}`}
        />
        <div className="px-1 py-4">
          <h3 className="text-sm font-semibold text-foreground">{topic.title}</h3>
          <p className="mt-1 text-xs text-foreground-subtle">
            {topic.videos.length} видео · от {formatPrice(topic.price)} / мес.
          </p>
        </div>
      </article>
    </Link>
  );
}
