"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Course = { id: string; title: string; description: string; instructor: { name: string } };

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch("/api/dashboard/courses");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Не удалось загрузить курсы.");
        setCourses(data.courses ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить курсы.");
      } finally {
        setIsLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-foreground">Мои курсы</h2>
      {isLoading && <p className="mt-4 text-foreground-muted">Загружаем курсы…</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!isLoading && !error && courses.length === 0 && (
        <div className="mt-5 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">У вас пока нет курсов</h3>
          <p className="mt-2 text-foreground-muted">Выберите курс в каталоге, чтобы начать изучать английский.</p>
          <Link href="/#catalog" className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-white">Открыть каталог</Link>
        </div>
      )}
      {!isLoading && !error && courses.length > 0 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5">
              <h3 className="text-xl font-semibold text-foreground">{course.title}</h3>
              <p className="mt-2 text-sm text-foreground-muted">{course.description}</p>
              <p className="mt-4 text-sm text-foreground-subtle">Преподаватель: {course.instructor.name}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
