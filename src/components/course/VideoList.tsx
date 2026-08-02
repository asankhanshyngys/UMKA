import { ListVideo } from "lucide-react";
import type { Video } from "@/types/course";
import { VideoItem } from "./VideoItem";

interface VideoListProps {
  videos: Video[];
}

export function VideoList({ videos }: VideoListProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <ListVideo className="h-5 w-5 text-foreground-muted" />
        <h2 className="text-lg font-semibold text-foreground">Видеоуроки</h2>
      </div>

      <ul className="space-y-3">
        {videos.map((video, index) => (
          <VideoItem key={video.id} video={video} index={index} />
        ))}
      </ul>
    </section>
  );
}
