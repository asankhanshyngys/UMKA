import type { SubscriptionPlan } from "@/types/course";
import { PricingCard } from "./PricingCard";

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
}

export function SubscriptionPlans({ plans }: SubscriptionPlansProps) {
  return (
    <section id="subscriptions" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 space-y-3">
        <p className="text-xs font-medium uppercase tracking-label text-foreground-subtle">
          Подписки
        </p>
        <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Полный доступ ко всем урокам
        </h2>
        <p className="max-w-xl text-base text-foreground-muted">
          Оформите подписку и смотрите любые видео без ограничений на выбранный
          срок.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}
