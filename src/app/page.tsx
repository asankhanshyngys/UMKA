import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/landing/Hero";
import { SubscriptionPlans } from "@/components/landing/SubscriptionPlans";
import { TopicCatalog } from "@/components/landing/TopicCatalog";
import { subscriptionPlans } from "@/data/mockData";
import { getPublishedCourses } from "@/features/catalog/server";
import type { CatalogCourse } from "@/features/catalog/types";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const t = await getTranslations("catalog");
  let courses: CatalogCourse[] = [];
  let catalogUnavailable = false;

  try {
    courses = await getPublishedCourses();
  } catch (error) {
    console.error("Could not load the public course catalog", error);
    catalogUnavailable = true;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <div className="mx-auto max-w-6xl px-6">
        <hr className="border-border" />
      </div>
      <SubscriptionPlans plans={subscriptionPlans} />
      <div className="mx-auto max-w-6xl px-6">
        <hr className="border-border" />
      </div>
      {catalogUnavailable ? (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-foreground-muted">{t("unavailable")}</p>
        </section>
      ) : (
        <TopicCatalog courses={courses} />
      )}
    </div>
  );
}
