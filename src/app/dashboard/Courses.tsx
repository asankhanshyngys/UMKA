import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { DashboardCourses } from "@/features/dashboard/server";

type CoursesProps = {
  data: DashboardCourses;
};

export default async function Courses({ data }: CoursesProps) {
  const t = await getTranslations("dashboard");
  const { courses, standaloneLessons, purchasedModules, pendingRequests } = data;

  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-foreground">{t("myCourses")}</h2>

      {courses.length === 0 && standaloneLessons.length === 0 && purchasedModules.length === 0 && pendingRequests.length === 0 && (
        <div className="mt-5 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">{t("emptyTitle")}</h3>
          <p className="mt-2 text-foreground-muted">{t("emptyDescription")}</p>
          <Link href="/#catalog" className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-white">
            {t("openCatalog")}
          </Link>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <>
          <h2 className="mt-10 font-serif text-2xl text-foreground">{t("pendingRequests")}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-amber-200 bg-card p-5">
                <h3 className="text-xl font-semibold text-foreground">{request.title}</h3>
                <p className="mt-3 text-sm font-medium text-amber-700">{t("pendingRequest", { referenceCode: request.referenceCode })}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {courses.length > 0 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {courses.map((course) => {
            const percent =
              course.progress.totalPractices === 0
                ? 0
                : Math.round(
                    (course.progress.completedPractices / course.progress.totalPractices) * 100,
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
                {course.progress.totalPractices > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-foreground-muted">
                      <span>{t("practiceProgress")}</span>
                      <span>
                        {course.progress.completedPractices}/{course.progress.totalPractices}
                        {course.progress.averageScore !== null
                          ? ` · ${course.progress.averageScore}%`
                          : ""}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                      <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {standaloneLessons.length > 0 && (
        <>
          <h2 className="mt-10 font-serif text-2xl text-foreground">{t("myLessons")}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                {lesson.progress.totalPractices > 0 && (
                  <p className="mt-4 text-sm text-foreground-subtle">
                    {t("practice")}: {lesson.progress.completedPractices}/
                    {lesson.progress.totalPractices}
                    {lesson.progress.averageScore !== null
                      ? ` · ${lesson.progress.averageScore}%`
                      : ""}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </>
      )}

      {purchasedModules.length > 0 && (
        <>
          <h2 className="mt-10 font-serif text-2xl text-foreground">My modules</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {purchasedModules.map((courseModule) => (
              <Link key={courseModule.id} href={`/learn/module/${courseModule.id}`} className="rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5">
                <p className="text-xs text-foreground-subtle">{courseModule.course.title}</p>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{courseModule.title}</h3>
                <p className="mt-2 text-sm text-foreground-muted">{t("expires")} {new Date(courseModule.expiresAt).toLocaleDateString()}</p>
                {courseModule.progress.totalPractices > 0 && <p className="mt-4 text-sm text-foreground-subtle">{t("practice")}: {courseModule.progress.completedPractices}/{courseModule.progress.totalPractices}{courseModule.progress.averageScore !== null ? ` · ${courseModule.progress.averageScore}%` : ""}</p>}
              </Link>
            ))}
          </div>
        </>
      )}

    </section>
  );
}
