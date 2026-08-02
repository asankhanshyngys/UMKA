import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/landing/Hero";
import { SubscriptionPlans } from "@/components/landing/SubscriptionPlans";
import { TopicCatalog } from "@/components/landing/TopicCatalog";
import { subscriptionPlans, topics } from "@/data/mockData";

export default function Home() {
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
      <TopicCatalog topics={topics} />
    </div>
  );
}
