import type { SubscriptionPlan } from "@/types/course";

export const currency = "₸";

export function formatPrice(price: number): string {
  return `${price.toLocaleString("ru-RU")} ${currency}`;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "sub-1m",
    durationMonths: 1,
    price: 9990,
    label: "1 месяц",
    description: "Полный доступ ко всем видеоурокам на 30 дней",
  },
  {
    id: "sub-3m",
    durationMonths: 3,
    price: 24990,
    label: "3 месяца",
    description: "Полный доступ ко всем видеоурокам на 90 дней",
    popular: true,
  },
  {
    id: "sub-6m",
    durationMonths: 6,
    price: 44990,
    label: "6 месяцев",
    description: "Полный доступ ко всем видеоурокам на 180 дней",
  },
];
