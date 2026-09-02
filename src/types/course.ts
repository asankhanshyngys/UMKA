export interface SubscriptionPlan {
  id: string;
  durationMonths: 1 | 3 | 6;
  price: number;
  label: string;
  description: string;
  popular?: boolean;
}
