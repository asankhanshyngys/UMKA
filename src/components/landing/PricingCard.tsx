import { Check } from "lucide-react";
import type { SubscriptionPlan } from "@/types/course";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/data/mockData";

interface PricingCardProps {
  plan: SubscriptionPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <article
      className={`relative flex flex-col rounded-2xl bg-card p-6 ${
        plan.popular ? "ring-2 ring-accent" : "border border-border"
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-white">
          Популярный
        </span>
      )}

      <p className="text-sm font-medium text-foreground-muted">{plan.label}</p>
      <p className="mt-2 font-serif text-3xl text-foreground">
        {formatPrice(plan.price)}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
        {plan.description}
      </p>

      <ul className="mt-6 flex-1 space-y-2">
        <li className="flex items-start gap-2 text-sm text-foreground-muted">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          Все видеоуроки курса
        </li>
        <li className="flex items-start gap-2 text-sm text-foreground-muted">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          Все темы без ограничений
        </li>
        <li className="flex items-start gap-2 text-sm text-foreground-muted">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          Доступ на {plan.durationMonths}{" "}
          {plan.durationMonths === 1
            ? "месяц"
            : plan.durationMonths === 3
              ? "месяца"
              : "месяцев"}
        </li>
      </ul>

      <Button className="mt-8 w-full">Оформить</Button>
    </article>
  );
}
