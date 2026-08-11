"use server";

import { PaymentAccessType, PurchaseStatus, SubscriptionStatus } from "@/generated/prisma/client";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function refundPayment(paymentId: string, formData: FormData) {
  if (!await getCurrentAdmin()) throw new Error("Unauthorized");

  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const payment = await transaction.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status !== "SUCCESS") throw new Error("This payment cannot be refunded.");
    if (!payment.accessType || !payment.accessId) {
      throw new Error("This legacy payment is not linked to access and cannot be refunded safely.");
    }

    await transaction.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED", refundedAt: now, refundReason: reason || null },
    });

    const accessWhere = { id: payment.accessId, userId: payment.userId };
    switch (payment.accessType) {
      case PaymentAccessType.COURSE:
        await transaction.coursePurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.REFUNDED, expiresAt: now } });
        break;
      case PaymentAccessType.MODULE:
        await transaction.modulePurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.REFUNDED, expiresAt: now } });
        break;
      case PaymentAccessType.VIDEO:
        await transaction.videoPurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.REFUNDED, expiresAt: now } });
        break;
      case PaymentAccessType.SUBSCRIPTION:
        await transaction.subscription.updateMany({ where: accessWhere, data: { status: SubscriptionStatus.CANCELLED, expiresAt: now } });
        break;
    }
  });

  revalidatePath("/admin/payments");
}
