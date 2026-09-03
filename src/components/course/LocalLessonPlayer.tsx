"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { LessonPracticeData } from "./LessonPractice";
import { isLessonLocked } from "@/lib/learning";

const LessonPractice = dynamic(() => import("./LessonPractice").then((module) => module.LessonPractice), {
  ssr: false,
  loading: () => <div className="mt-6 h-32 animate-pulse rounded-2xl bg-card ring-1 ring-border" />,
});

export type LocalLesson = {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  storageKey: string;
  practices: LessonPracticeData[];
  prerequisitePracticeIds?: string[];
  module?: { id: string; title: string; order: number };
};

function localVideoUrl(storageKey: string) {
  const cleanKey = storageKey.replace(/^\/+/, "");
  return /^[a-zA-Z0-9_./-]+\.mp4$/i.test(cleanKey) && !cleanKey.includes("..") ? `/${cleanKey}` : null;
}

export function LocalLessonPlayer({ lessons, completedPracticeIds }: { lessons: LocalLesson[]; completedPracticeIds: string[] }) {
  const [activeId, setActiveId] = useState(lessons[0]?.id);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState(completedPracticeIds);
  const [collapsedModuleIds, setCollapsedModuleIds] = useState<string[]>([]);
  const [isLessonSheetOpen, setIsLessonSheetOpen] = useState(false);
  const activeLesson = lessons.find((lesson) => lesson.id === activeId) ?? lessons[0];
  const videoUrl = activeLesson ? localVideoUrl(activeLesson.storageKey) : null;
  const isLocked = (lesson: LocalLesson) => isLessonLocked(lessons, lessons.indexOf(lesson), completedIds, lesson.prerequisitePracticeIds?.length === 0);
  const groups = lessons.reduce<{ module: LocalLesson["module"]; lessons: LocalLesson[] }[]>((result, lesson) => {
    const previous = result.at(-1);
    if (!previous || previous.module?.id !== lesson.module?.id) result.push({ module: lesson.module, lessons: [lesson] });
    else previous.lessons.push(lesson);
    return result;
  }, []);

  useEffect(() => {
    if (!isLessonSheetOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsLessonSheetOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isLessonSheetOpen]);

  async function selectLesson(id: string) {
    const lesson = lessons.find((item) => item.id === id);
    if (lesson && isLocked(lesson)) return;
    setActiveId(id);
    setIsLessonSheetOpen(false);
    if (lesson?.module) setCollapsedModuleIds((current) => current.filter((moduleId) => moduleId !== lesson.module?.id));
    setPlaybackUrl(null);
    setPlaybackError(null);
    if (!lesson?.storageKey.startsWith("cfstream:")) return;
    const response = await fetch(`/api/videos/${id}/playback`, { cache: "no-store" });
    const payload = (await response.json()) as { playbackUrl?: string; error?: string };
    if (!response.ok || !payload.playbackUrl) return setPlaybackError(payload.error ?? "Unable to load the secure video.");
    setPlaybackUrl(payload.playbackUrl);
  }

  function toggleModule(moduleId: string) {
    setCollapsedModuleIds((current) => current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId]);
  }

  async function markVideoComplete(videoId: string, duration: number) {
    const payload = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ position: duration }), cache: "no-store" as RequestCache };
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(`/api/videos/${videoId}/progress`, payload);
        if (response.ok) return;
      } catch {
        // A transient mobile-network failure should not interrupt the lesson.
      }
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (!activeLesson) return <p className="rounded-2xl border border-dashed border-border p-8 text-foreground-muted">No lessons in this course yet.</p>;
  const usesCloudflareStream = activeLesson.storageKey.startsWith("cfstream:");
  const player = usesCloudflareStream
    ? playbackUrl
      ? <iframe key={playbackUrl} className="h-full w-full" src={playbackUrl} title={activeLesson.title} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowFullScreen />
      : <button onClick={() => selectLesson(activeLesson.id)} className="h-full w-full p-8 text-center text-sm text-white/75">{playbackError ?? "Click to load the protected video."}</button>
    : videoUrl
      ? <video key={activeLesson.id} controls controlsList="nodownload" onEnded={() => void markVideoComplete(activeLesson.id, activeLesson.duration)} className="h-full w-full" src={videoUrl}>Your browser does not support video.</video>
      : <div className="flex h-full items-center justify-center p-8 text-center text-sm text-white/75">For testing, use <code className="mx-1 rounded bg-white/10 px-1">videos/test-lesson.mp4</code>.</div>;

  const lessonList = <><p className="px-2 pb-3 text-sm font-semibold">Course content</p><div className="space-y-3">{groups.map((group, groupIndex) => { const moduleId = group.module?.id; const collapsed = Boolean(moduleId && collapsedModuleIds.includes(moduleId)); return <div key={moduleId ?? groupIndex}>{group.module && <button type="button" onClick={() => toggleModule(moduleId!)} aria-expanded={!collapsed} className="flex min-h-11 w-full items-center justify-between rounded-lg bg-background px-3 py-2 text-left hover:brightness-95"><span><span className="block text-xs font-semibold uppercase tracking-wide text-accent">Module {group.module.order}</span><span className="mt-1 block text-sm font-semibold text-foreground">{group.module.title}</span></span><span aria-hidden="true" className="text-lg text-foreground-muted">{collapsed ? "+" : "−"}</span></button>}{!collapsed && <div className="mt-1 space-y-1">{group.lessons.map((lesson) => { const locked = isLocked(lesson); const number = lessons.indexOf(lesson) + 1; return <button key={lesson.id} disabled={locked} onClick={() => void selectLesson(lesson.id)} className={`min-h-11 w-full rounded-xl p-3 text-left text-sm transition-colors ${lesson.id === activeLesson.id ? "bg-background text-foreground" : "text-foreground-muted hover:bg-background"} ${locked ? "cursor-not-allowed opacity-50" : ""}`}><span className="block text-xs text-foreground-subtle">Lesson {number} · {Math.ceil(lesson.duration / 60)} min{locked ? " · Locked" : ""}</span><span className="mt-1 block font-medium">{lesson.title}</span></button>; })}</div>}</div>; })}</div></>;
  const activeNumber = lessons.indexOf(activeLesson) + 1;
  const previousLesson = lessons[activeNumber - 2];
  const nextLesson = lessons[activeNumber];
  const previousLocked = previousLesson ? isLocked(previousLesson) : true;
  const nextLocked = nextLesson ? isLocked(nextLesson) : true;

  return <><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="contents lg:block"><section className="sticky top-0 z-30 rounded-2xl bg-accent p-4 lg:static lg:z-auto"><div className="aspect-video max-h-[45vh] overflow-hidden rounded-xl bg-black">{player}</div></section><div className="lg:hidden"><h2 className="mt-4 text-xl font-semibold text-foreground">{activeLesson.title}</h2>{activeLesson.description && <p className="mt-2 text-sm text-foreground-muted">{activeLesson.description}</p>}<div className="mt-4 grid grid-cols-2 gap-2"><button type="button" disabled={!previousLesson || previousLocked} onClick={() => previousLesson && void selectLesson(previousLesson.id)} className="min-h-11 rounded-lg border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">Previous lesson</button><button type="button" disabled={!nextLesson || nextLocked} onClick={() => nextLesson && void selectLesson(nextLesson.id)} className="min-h-11 rounded-lg bg-accent px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40">Next lesson</button></div><button type="button" onClick={() => setIsLessonSheetOpen(true)} className="mt-2 flex min-h-11 w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-2 text-left text-sm"><span>Lesson {activeNumber} of {lessons.length} · {activeLesson.title}</span><span aria-hidden="true">›</span></button></div><div className="hidden lg:block"><h2 className="mt-4 text-xl font-semibold text-white">{activeLesson.title}</h2>{activeLesson.description && <p className="mt-2 text-sm text-white/70">{activeLesson.description}</p>}</div></div><aside className="hidden rounded-2xl border border-border bg-card p-3 lg:block">{lessonList}</aside></div>{isLessonSheetOpen && <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" role="presentation" onClick={() => setIsLessonSheetOpen(false)}><section role="dialog" aria-modal="true" aria-label="Course content" onClick={(event) => event.stopPropagation()} className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl">{lessonList}</section></div>}<LessonPractice key={activeLesson.id} practices={activeLesson.practices} completedPracticeIds={completedIds} onCompleted={(practiceId) => setCompletedIds((current) => current.includes(practiceId) ? current : [...current, practiceId])} /></>;
}
