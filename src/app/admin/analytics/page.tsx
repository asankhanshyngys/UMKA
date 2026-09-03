import { BarChart3, CreditCard, GraduationCap, RefreshCw, Users } from "lucide-react";
import { PaymentStatus, SubscriptionStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { DailySalesChart } from "./DailySalesChart";

const DAY_MS = 24 * 60 * 60 * 1000;
const formatTenge = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? "0%" : "Новый";
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change >= 0 ? "+" : ""}${change}%`;
}

export default async function AnalyticsPage() {
  const now = new Date();
  const today = startOfDay(now);
  const periodStart = new Date(today.getTime() - 29 * DAY_MS);
  const previousPeriodStart = new Date(periodStart.getTime() - 30 * DAY_MS);
  const sellableStatuses: PaymentStatus[] = [PaymentStatus.SUCCESS, PaymentStatus.REFUNDED];

  const [periodPayments, previousPayments, users, totalUsers, activeSubscriptions, completedVideos, startedVideos] = await Promise.all([
    prisma.payment.findMany({
      where: { OR: [{ createdAt: { gte: periodStart } }, { refundedAt: { gte: periodStart } }] },
      select: { amount: true, status: true, createdAt: true, refundedAt: true, userId: true, accessType: true },
    }),
    prisma.payment.findMany({
      where: { createdAt: { gte: previousPeriodStart, lt: periodStart }, status: { in: sellableStatuses } },
      select: { amount: true },
    }),
    prisma.user.findMany({ where: { createdAt: { gte: periodStart } }, select: { id: true } }),
    prisma.user.count(),
    prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE, expiresAt: { gt: now } } }),
    prisma.videoProgress.count({ where: { completed: true } }),
    prisma.videoProgress.count(),
  ]);

  const sales = periodPayments.filter((payment) => payment.createdAt >= periodStart && sellableStatuses.includes(payment.status));
  const refunds = periodPayments.filter((payment) => payment.status === PaymentStatus.REFUNDED && payment.refundedAt && payment.refundedAt >= periodStart);
  const grossRevenue = sales.reduce((sum, payment) => sum + payment.amount, 0);
  const refundedAmount = refunds.reduce((sum, payment) => sum + payment.amount, 0);
  const netRevenue = grossRevenue - refundedAmount;
  const previousRevenue = previousPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidUserIds = new Set(sales.map((payment) => payment.userId));
  const newCustomerCount = users.filter((user) => paidUserIds.has(user.id)).length;
  const conversionRate = users.length === 0 ? 0 : Math.round((newCustomerCount / users.length) * 1000) / 10;
  const completionRate = startedVideos === 0 ? 0 : Math.round((completedVideos / startedVideos) * 100);
  const maxDailyRevenue = Math.max(1, ...Array.from({ length: 30 }, (_, index) => {
    const day = new Date(periodStart.getTime() + index * DAY_MS);
    return sales.filter((payment) => startOfDay(payment.createdAt).getTime() === day.getTime()).reduce((sum, payment) => sum + payment.amount, 0);
  }));

  const dailySales = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(periodStart.getTime() + index * DAY_MS);
    const revenue = sales.filter((payment) => startOfDay(payment.createdAt).getTime() === date.getTime()).reduce((sum, payment) => sum + payment.amount, 0);
    return { label: date.toLocaleDateString("ru-RU", { month: "short", day: "numeric" }), revenue };
  });

  const salesByType = ["COURSE", "MODULE", "VIDEO", "SUBSCRIPTION"].map((type) => ({
    type: ({ COURSE: "Курс", MODULE: "Модуль", VIDEO: "Урок", SUBSCRIPTION: "Подписка" } as Record<string, string>)[type],
    revenue: sales.filter((payment) => payment.accessType === type).reduce((sum, payment) => sum + payment.amount, 0),
    orders: sales.filter((payment) => payment.accessType === type).length,
  })).filter((item) => item.orders > 0);

  const metrics = [
    { label: "Чистая выручка", value: `${formatTenge.format(netRevenue)} ₸`, detail: `${percentageChange(grossRevenue, previousRevenue)} валовых продаж к предыдущим 30 дням`, icon: CreditCard },
    { label: "Заказы", value: String(sales.length), detail: `Средний заказ: ${formatTenge.format(sales.length ? Math.round(grossRevenue / sales.length) : 0)} ₸`, icon: BarChart3 },
    { label: "Конверсия новых пользователей", value: `${conversionRate}%`, detail: `Купили ${newCustomerCount} из ${users.length} новых аккаунтов`, icon: Users },
    { label: "Завершение обучения", value: `${completionRate}%`, detail: `Завершённых видео: ${completedVideos}`, icon: GraduationCap },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="text-sm text-foreground-subtle">Последние 30 дней</p><h1 className="mt-1 font-serif text-4xl">Аналитика</h1><p className="mt-3 text-foreground-muted">Продажи, возвраты, конверсия и вовлечённость в обучение.</p></div>
        <p className="text-sm text-foreground-muted">{totalUsers} зарегистрированных учеников · {activeSubscriptions} активных подписок</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon }) => <article key={label} className="rounded-2xl border border-border bg-card p-5"><Icon className="h-5 w-5 text-accent" /><p className="mt-5 text-3xl font-semibold">{value}</p><p className="mt-1 font-medium">{label}</p><p className="mt-2 text-sm text-foreground-muted">{detail}</p></article>)}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between"><div><h2 className="font-serif text-2xl">Продажи по дням</h2><p className="mt-1 text-sm text-foreground-muted">Валовые оплаченные продажи по дате оформления.</p></div><p className="text-sm text-foreground-muted">{formatTenge.format(grossRevenue)} ₸ всего</p></div>
        <DailySalesChart dailySales={dailySales} maxDailyRevenue={maxDailyRevenue} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6"><h2 className="font-serif text-2xl">Продажи по товарам</h2><div className="mt-5 space-y-4">{salesByType.length === 0 ? <p className="text-sm text-foreground-muted">За этот период продаж не было.</p> : salesByType.map((item) => <div key={item.type} className="flex items-center justify-between"><div><p className="font-medium">{item.type}</p><p className="text-sm text-foreground-muted">Заказов: {item.orders}</p></div><p className="font-medium">{formatTenge.format(item.revenue)} ₸</p></div>)}</div></article>
        <article className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-2"><RefreshCw className="h-5 w-5 text-accent" /><h2 className="font-serif text-2xl">Возвраты</h2></div><p className="mt-5 text-3xl font-semibold">{formatTenge.format(refundedAmount)} ₸</p><p className="mt-1 text-sm text-foreground-muted">Возвратов за последние 30 дней: {refunds.length}.</p><p className="mt-5 text-sm text-foreground-muted">Доля возвратов: {sales.length === 0 ? 0 : Math.round((refunds.length / sales.length) * 1000) / 10}% от заказов.</p></article>
      </section>
    </div>
  );
}
