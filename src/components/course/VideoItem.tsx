import { CheckCircle2, Circle, Lock } from "lucide-react";
import type { Video } from "@/types/course";
import { formatPrice } from "@/data/mockData";
import { Button } from "@/components/ui/Button";

interface VideoItemProps {
  video: Video;
  index: number;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    iconClass: "text-accent",
    labelClass: "text-foreground",
    badge: "Просмотрен",
    badgeClass: "bg-accent/10 text-accent",
  },
  current: {
    icon: Circle,
    iconClass: "text-accent fill-accent/20",
    labelClass: "text-foreground font-medium",
    badge: "Доступен",
    badgeClass: "bg-accent/10 text-accent",
  },
  locked: {
    icon: Lock,
    iconClass: "text-foreground-subtle",
    labelClass: "text-foreground-muted",
    badge: "Заблокирован",
    badgeClass: "bg-background text-foreground-subtle",
  },
} as const;

export function VideoItem({ video, index }: VideoItemProps) {
  const config = statusConfig[video.status];
  const Icon = config.icon;

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Icon className={`h-5 w-5 shrink-0 ${config.iconClass}`} />
        <div>
          <p className={`text-sm ${config.labelClass}`}>
            <span className="mr-2 text-foreground-subtle">
              {String(index + 1).padStart(2, "0")}
            </span>
            {video.title}
          </p>
          <p className="mt-0.5 text-xs text-foreground-subtle">
            {video.duration} · {formatPrice(video.price)} / мес.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:shrink-0">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${config.badgeClass}`}
        >
          {config.badge}
        </span>
        {video.status === "locked" && (
          <Button className="px-4 py-2 text-xs">Купить</Button>
        )}
      </div>
    </li>
  );
}
