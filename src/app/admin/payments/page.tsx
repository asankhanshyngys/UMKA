import { Check, CreditCard, RotateCcw, X } from "lucide-react";
import { PaymentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { confirmPayment, refundPayment, rejectPayment } from "./actions";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const accessIds = payments.flatMap((payment) => payment.accessId ? [payment.accessId] : []);
  const [users, courses, modules, books, subscriptions] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: [...new Set(payments.map((payment) => payment.userId))] } }, select: { id: true, email: true, name: true } }),
    prisma.coursePurchase.findMany({ where: { id: { in: accessIds } }, include: { course: { select: { title: true } } } }),
    prisma.modulePurchase.findMany({ where: { id: { in: accessIds } }, include: { module: { include: { course: { select: { title: true } } } } } }),
    prisma.bookPurchase.findMany({ where: { id: { in: accessIds } }, include: { book: { select: { title: true } } } }),
    prisma.subscription.findMany({ where: { id: { in: accessIds } }, select: { id: true, plan: true } }),
  ]);
  const usersById = new Map(users.map((user) => [user.id, user]));
  const itemByAccessId = new Map<string, string>([
    ...courses.map((purchase) => [purchase.id, `Course: ${purchase.course.title}`] as [string, string]),
    ...modules.map((purchase) => [purchase.id, `Module: ${purchase.module.course.title} — ${purchase.module.title}`] as [string, string]),
    ...books.map((purchase) => [purchase.id, `Book: ${purchase.book.title}`] as [string, string]),
    ...subscriptions.map((subscription) => [subscription.id, `Subscription: ${subscription.plan.replaceAll("_", " ")}`] as [string, string]),
  ]);
  const pendingPayments = payments.filter((payment) => payment.status === PaymentStatus.PENDING && payment.provider === "whatsapp");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-foreground-subtle">Payments</p>
        <h1 className="mt-1 font-serif text-4xl">WhatsApp requests & refunds</h1>
        <p className="mt-3 text-foreground-muted">Confirm a WhatsApp request only after payment is verified. Access starts at the moment of confirmation.</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5"><h2 className="font-serif text-2xl">Awaiting WhatsApp confirmation</h2></div>
        {pendingPayments.length === 0 ? <p className="p-6 text-foreground-muted">No WhatsApp requests are waiting.</p> : pendingPayments.map((payment) => {
          const user = usersById.get(payment.userId);
          return <article key={payment.id} className="border-b border-border p-5 last:border-b-0"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><CreditCard className="h-4 w-4 text-accent" /><p className="font-medium">{payment.amount.toLocaleString("en-US")} ₸ · {itemByAccessId.get(payment.accessId ?? "") ?? payment.accessType?.toLowerCase() ?? "Unknown item"}</p></div><p className="mt-2 text-sm font-semibold text-accent">Request code: {payment.referenceCode}</p><p className="mt-1 truncate text-sm text-foreground-muted">{user?.name ?? "Unknown user"} · {user?.email ?? payment.userId}</p><p className="mt-1 text-xs text-foreground-subtle">Submitted {payment.createdAt.toLocaleString()}</p></div><div className="flex flex-col gap-2 sm:flex-row"><form action={confirmPayment.bind(null, payment.id)}><button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm text-white"><Check className="h-4 w-4" />Confirm</button></form><form action={rejectPayment.bind(null, payment.id)} className="flex flex-col gap-2 sm:flex-row"><input name="reason" maxLength={500} placeholder="Reason (optional)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" /><button className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"><X className="h-4 w-4" />Reject</button></form></div></div></article>;
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5"><h2 className="font-serif text-2xl">Payment history</h2></div>
        {payments.length === 0 ? <p className="p-6 text-foreground-muted">No payments yet.</p> : payments.map((payment) => {
          const user = usersById.get(payment.userId);
          const canRefund = payment.status === PaymentStatus.SUCCESS && Boolean(payment.accessType && payment.accessId);
          return <article key={payment.id} className="border-b border-border p-5 last:border-b-0"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-accent" /><p className="font-medium">{payment.amount.toLocaleString("en-US")} ₸ · {itemByAccessId.get(payment.accessId ?? "") ?? payment.accessType?.toLowerCase() ?? "Legacy payment"}</p></div><p className="mt-1 truncate text-sm text-foreground-muted">{user?.name ?? "Unknown user"} · {user?.email ?? payment.userId}</p><p className="mt-1 text-xs text-foreground-subtle">{payment.provider} · {payment.referenceCode} · {payment.createdAt.toLocaleString()}</p>{payment.refundReason && <p className="mt-2 text-sm text-foreground-muted">Reason: {payment.refundReason}</p>}</div>{canRefund ? <form action={refundPayment.bind(null, payment.id)} className="flex flex-col gap-2 sm:flex-row"><input name="reason" maxLength={500} placeholder="Refund reason (optional)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" /><button className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"><RotateCcw className="h-4 w-4" />Refund</button></form> : <span className="text-sm text-foreground-muted">{payment.status}</span>}</div></article>;
        })}
      </section>
    </div>
  );
}
