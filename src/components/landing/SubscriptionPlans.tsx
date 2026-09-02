import { getTranslations } from "next-intl/server";
import type { SubscriptionPlan } from "@/types/course";
import { PricingCard } from "./PricingCard";

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
}

export async function SubscriptionPlans({ plans }: SubscriptionPlansProps) {
  const t = await getTranslations("subscriptions");

  return (
    <section id="subscriptions" className="mx-auto max-w-6xl px-4 py-20 sm:px-0">
      <div className="mb-10 space-y-3">
        <p className="text-xs font-medium uppercase tracking-label text-foreground-subtle">
          {t("eyebrow")}
        </p>
        <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h2>
        <p className="max-w-xl text-base text-foreground-muted">{t("description")}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}
