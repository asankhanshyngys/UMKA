import { BookOpen } from "lucide-react";
import type { Topic } from "@/types/course";
import { formatPrice } from "@/data/mockData";
import { Button } from "@/components/ui/Button";

interface TopicHeaderProps {
  topic: Topic;
}

export function TopicHeader({ topic }: TopicHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-accent">
        <BookOpen className="h-5 w-5" />
        <span className="text-sm font-medium">Тема · доступ 1 месяц</span>
      </div>

      <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
        {topic.title}
      </h1>

      <p className="max-w-2xl text-base leading-relaxed text-foreground-muted">
        {topic.description}
      </p>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <span className="text-2xl font-semibold text-foreground">
          {formatPrice(topic.price)}
        </span>
        <span className="text-sm text-foreground-subtle">
          · {topic.videos.length} видео · доступ на 1 месяц
        </span>
        <Button>Купить тему</Button>
      </div>
    </div>
  );
}
