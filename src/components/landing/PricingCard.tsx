import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { SubscriptionPlan } from "@/types/course";
import { formatPrice } from "@/data/mockData";
import { WhatsAppCheckoutButton } from "@/features/checkout/WhatsAppCheckoutButton";

interface PricingCardProps {
  plan: SubscriptionPlan;
}

export async function PricingCard({ plan }: PricingCardProps) {
  const t = await getTranslations("pricing");
  const planKey = plan.id as "sub-1m" | "sub-3m" | "sub-6m";

  return (
    <article
      className={`relative flex flex-col rounded-2xl bg-card p-6 ${
        plan.popular ? "ring-2 ring-accent" : "border border-border"
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-white">
          {t("popular")}
        </span>
      )}

      <p className="text-sm font-medium text-foreground-muted">{t(`plans.${planKey}.label`)}</p>
      <p className="mt-2 font-serif text-3xl text-foreground">{formatPrice(plan.price)}</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
        {t(`plans.${planKey}.description`)}
      </p>

      <ul className="mt-6 flex-1 space-y-2">
        <li className="flex items-start gap-2 text-sm text-foreground-muted">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          {t("allVideos")}
        </li>
        <li className="flex items-start gap-2 text-sm text-foreground-muted">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          {t("allTopics")}
        </li>
        <li className="flex items-start gap-2 text-sm text-foreground-muted">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          {t("accessFor", { count: plan.durationMonths })}
        </li>
      </ul>

      <WhatsAppCheckoutButton
        target={{ type: "subscription", months: plan.durationMonths }}
        className="mt-8"
      />
    </article>
  );
}
