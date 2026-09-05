import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/landing/Hero";
import { SubscriptionPlans } from "@/components/landing/SubscriptionPlans";
import { TopicCatalog } from "@/components/landing/TopicCatalog";
import { BooksCatalog } from "@/components/landing/BooksCatalog";
import { CatalogHashScroller } from "@/components/landing/CatalogHashScroller";
import { getPublishedCourses } from "@/features/catalog/server";
import { getPublishedBooks } from "@/features/books/server";
import { getSubscriptionPlans } from "@/lib/platform-settings";
import type { CatalogBook } from "@/features/books/server";
import type { CatalogCourse } from "@/features/catalog/types";
import { getTranslations } from "next-intl/server";
import * as Sentry from "@sentry/nextjs";

export default async function Home() {
  const t = await getTranslations("catalog");
  let courses: CatalogCourse[] = [];
  let books: CatalogBook[] = [];
  const subscriptionPlans = await getSubscriptionPlans();
  let catalogUnavailable = false;

  try {
    [courses, books] = await Promise.all([getPublishedCourses(), getPublishedBooks()]);
  } catch (error) {
    console.error("Could not load the public course catalog", error);
    Sentry.captureException(error);
    catalogUnavailable = true;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CatalogHashScroller />
      <main className="main-with-mobile-nav">
        <Hero />
        <div className="px-4 sm:px-6 lg:px-12 xl:px-20 ">
          <hr className="border-border" />
        </div>
        {catalogUnavailable ? (
          <section className="px-4 sm:px-6 lg:px-12 xl:px-20 py-20 ">
            <p className="text-foreground-muted">{t("unavailable")}</p>
          </section>
        ) : (
          <TopicCatalog courses={courses} />
        )}
        <BooksCatalog books={books} />
        <div className="px-4 sm:px-6 lg:px-12 xl:px-20 "><hr className="border-border" /></div>
        <SubscriptionPlans plans={subscriptionPlans} />
      </main>
    </div>
  );
}
