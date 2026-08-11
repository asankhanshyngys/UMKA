import { CreditCard, RotateCcw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { refundPayment } from "./actions";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const users = await prisma.user.findMany({
    where: { id: { in: [...new Set(payments.map((payment) => payment.userId))] } },
    select: { id: true, email: true, name: true },
  });
  const usersById = new Map(users.map((user) => [user.id, user]));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-foreground-subtle">Payments</p>
        <h1 className="mt-1 font-serif text-4xl">Refunds</h1>
        <p className="mt-3 text-foreground-muted">Mark a completed payment as refunded and immediately revoke its linked course access.</p>
      </div>
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        {payments.length === 0 ? <p className="p-6 text-foreground-muted">No payments yet.</p> : payments.map((payment) => {
          const user = usersById.get(payment.userId);
          const canRefund = payment.status === "SUCCESS" && Boolean(payment.accessType && payment.accessId);
          return <article key={payment.id} className="border-b border-border p-5 last:border-b-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-accent" /><p className="font-medium">{payment.amount.toLocaleString("en-US")} ₸ · {payment.accessType?.toLowerCase() ?? "legacy payment"}</p></div>
                <p className="mt-1 truncate text-sm text-foreground-muted">{user?.name ?? "Unknown user"} · {user?.email ?? payment.userId}</p>
                <p className="mt-1 text-xs text-foreground-subtle">{payment.provider} · {payment.transactionId ?? "No transaction ID"} · {payment.createdAt.toLocaleString()}</p>
                {payment.refundReason && <p className="mt-2 text-sm text-foreground-muted">Reason: {payment.refundReason}</p>}
              </div>
              {canRefund ? <form action={refundPayment.bind(null, payment.id)} className="flex flex-col gap-2 sm:flex-row">
                <input name="reason" maxLength={500} placeholder="Refund reason (optional)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"><RotateCcw className="h-4 w-4" />Refund</button>
              </form> : <span className={payment.status === "REFUNDED" ? "text-sm text-foreground-muted" : "text-sm text-amber-700"}>{payment.status === "REFUNDED" ? "Refunded" : "Legacy payment — no linked access"}</span>}
            </div>
          </article>;
        })}
      </section>
    </div>
  );
}
