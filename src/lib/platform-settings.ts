import { unstable_cache } from "next/cache";
import { assertDatabaseConfigured, prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { SubscriptionPlan } from "@/types/course";

const subscriptionPlanDefaults: SubscriptionPlan[] = [
  { id: "sub-1m", durationMonths: 1, price: 9990, label: "", description: "" },
  { id: "sub-3m", durationMonths: 3, price: 24990, label: "", description: "", popular: true },
  { id: "sub-6m", durationMonths: 6, price: 44990, label: "", description: "" },
];

export const getPlatformSettings = unstable_cache(
  async () => {
    assertDatabaseConfigured();
    return prisma.platformSettings.findFirst();
  },
  ["platform-settings"],
  { tags: [CACHE_TAGS.settings], revalidate: 300 },
);

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const settings = await getPlatformSettings();

  if (!settings) return subscriptionPlanDefaults;

  return subscriptionPlanDefaults.map((plan) => ({
    ...plan,
    price: plan.durationMonths === 1
      ? settings.oneMonthSubscription
      : plan.durationMonths === 3
        ? settings.threeMonthSubscription
        : settings.sixMonthSubscription,
  }));
}
