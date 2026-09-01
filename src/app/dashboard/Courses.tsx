"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Course = {
  id: string;
  title: string;
  description: string;
  instructor: { name: string };
  progress: {
    totalVideos: number;
    completedVideos: number;
    totalPractices: number;
    completedPractices: number;
    averageScore: number | null;
  };
};

type StandaloneLesson = {
  id: string;
  title: string;
  duration: number;
  course: { id: string; title: string };
  expiresAt: string;
  progress: {
    totalPractices: number;
    completedPractices: number;
    averageScore: number | null;
  };
};

type PurchasedModule = {
  id: string;
  title: string;
  course: { id: string; title: string };
  expiresAt: string;
  progress: StandaloneLesson["progress"];
};

function PracticeSummary({
  completed,
  total,
  averageScore,
  emptyLabel,
  prefix,
}: {
  completed: number;
  total: number;
  averageScore: number | null;
  emptyLabel: string;
  prefix: string;
}) {
  if (total === 0) {
    return <p className="mt-4 text-sm text-foreground-subtle">{emptyLabel}</p>;
  }

  return (
    <p className="mt-4 text-sm text-foreground-subtle">
      {prefix}: {completed}/{total}
      {averageScore !== null ? ` · ${averageScore}%` : ""}
    </p>
  );
}

function CourseSkeletons({ label }: { label: string }) {
  return (
    <div
      className="mt-5 grid gap-5 sm:grid-cols-2"
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="h-6 w-3/4 rounded-lg bg-foreground-subtle/20 motion-safe:animate-pulse" />
          <div className="mt-3 h-4 w-full rounded-lg bg-foreground-subtle/15 motion-safe:animate-pulse" />
          <div className="mt-2 h-4 w-5/6 rounded-lg bg-foreground-subtle/15 motion-safe:animate-pulse" />
          <div className="mt-4 h-3 w-1/2 rounded-lg bg-foreground-subtle/15 motion-safe:animate-pulse" />
          <div className="mt-2 h-3 w-2/5 rounded-lg bg-foreground-subtle/15 motion-safe:animate-pulse" />
          <div className="mt-4 h-2 w-full rounded-full bg-foreground-subtle/15 motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function Courses() {
  const t = useTranslations("dashboard");
  const [courses, setCourses] = useState<Course[]>([]);
  const [standaloneLessons, setStandaloneLessons] = useState<StandaloneLesson[]>([]);
  const [purchasedModules, setPurchasedModules] = useState<PurchasedModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch("/api/dashboard/courses");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? t("loadError"));
        setCourses(data.courses ?? []);
        setStandaloneLessons(data.standaloneLessons ?? []);
        setPurchasedModules(data.purchasedModules ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("loadError"));
      } finally {
        setIsLoading(false);
      }
    }
    loadCourses();
  }, [t]);

  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-foreground">{t("myCourses")}</h2>

      {isLoading && <CourseSkeletons label={t("loading")} />}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      {!isLoading && !error && courses.length === 0 && standaloneLessons.length === 0 && purchasedModules.length === 0 && (
        <div className="mt-5 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">{t("emptyTitle")}</h3>
          <p className="mt-2 text-foreground-muted">{t("emptyDescription")}</p>
          <Link href="/#catalog" className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-white">
            {t("openCatalog")}
          </Link>
        </div>
      )}

      {!isLoading && !error && courses.length > 0 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {courses.map((course) => {
            const hasPractices = course.progress.totalPractices > 0;
            const percent = hasPractices
              ? Math.round(
                  (course.progress.completedPractices / course.progress.totalPractices) * 100,
                )
              : course.progress.totalVideos === 0
                ? 0
                : Math.round(
                    (course.progress.completedVideos / course.progress.totalVideos) * 100,
                  );

            return (
              <Link
                key={course.id}
                href={`/learn/${course.id}`}
                className="rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5"
              >
                <h3 className="text-xl font-semibold text-foreground">{course.title}</h3>
                <p className="mt-2 text-sm text-foreground-muted">{course.description}</p>
                <p className="mt-4 text-sm text-foreground-subtle">
                  {t("instructor")}: {course.instructor.name}
                </p>
                <p className="mt-2 text-sm text-foreground-subtle">Lessons: {course.progress.completedVideos}/{course.progress.totalVideos}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-foreground-muted">
                    <span>{hasPractices ? t("practiceProgress") : t("lessonProgress")}</span>
                    <span>
                      {hasPractices
                        ? `${course.progress.completedPractices}/${course.progress.totalPractices}${
                            course.progress.averageScore !== null
                              ? ` · ${course.progress.averageScore}%`
                              : ""
                          }`
                        : `${course.progress.completedVideos}/${course.progress.totalVideos}`}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                    <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!isLoading && !error && standaloneLessons.length > 0 && (
        <>
          <h2 className="mt-10 font-serif text-2xl text-foreground">{t("myLessons")}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {standaloneLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/learn/video/${lesson.id}`}
                className="rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5"
              >
                <p className="text-xs text-foreground-subtle">{lesson.course.title}</p>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{lesson.title}</h3>
                <p className="mt-2 text-sm text-foreground-muted">
                  {Math.ceil(lesson.duration / 60)} {t("min")} · {t("expires")}{" "}
                  {new Date(lesson.expiresAt).toLocaleDateString()}
                </p>
                <PracticeSummary
                  completed={lesson.progress.completedPractices}
                  total={lesson.progress.totalPractices}
                  averageScore={lesson.progress.averageScore}
                  emptyLabel={t("noPractices")}
                  prefix={t("practice")}
                />
              </Link>
            ))}
          </div>
        </>
      )}

      {!isLoading && !error && purchasedModules.length > 0 && (
        <>
          <h2 className="mt-10 font-serif text-2xl text-foreground">My modules</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {purchasedModules.map((courseModule) => (
              <Link key={courseModule.id} href={`/learn/module/${courseModule.id}`} className="rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5">
                <p className="text-xs text-foreground-subtle">{courseModule.course.title}</p>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{courseModule.title}</h3>
                <p className="mt-2 text-sm text-foreground-muted">{t("expires")} {new Date(courseModule.expiresAt).toLocaleDateString()}</p>
                <PracticeSummary
                  completed={courseModule.progress.completedPractices}
                  total={courseModule.progress.totalPractices}
                  averageScore={courseModule.progress.averageScore}
                  emptyLabel={t("noPractices")}
                  prefix={t("practice")}
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
