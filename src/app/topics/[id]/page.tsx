import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { TopicHeader } from "@/components/course/TopicHeader";
import { VideoList } from "@/components/course/VideoList";
import { Card } from "@/components/ui/Card";
import { getTopicById } from "@/data/mockData";

interface TopicPageProps {
  params: Promise<{ id: string }>;
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { id } = await params;
  const topic = getTopicById(id);

  if (!topic) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <Link
          href="/#catalog"
          className="mb-10 inline-flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к темам
        </Link>

        <div className="space-y-10">
          <TopicHeader topic={topic} />

          <Card>
            <p className="text-sm text-foreground-muted">
              Подписка на 1, 3 или 6 месяцев открывает доступ ко{" "}
              <strong className="font-medium text-foreground">всем</strong>{" "}
              видеоурокам сразу. Отдельная покупка темы или ролика — доступ
              только на 1 месяц.
            </p>
          </Card>

          <VideoList videos={topic.videos} />
        </div>
      </div>
    </div>
  );
}
