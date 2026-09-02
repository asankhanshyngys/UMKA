"use server";

import { revalidatePath } from "next/cache";
import { PaymentAccessType, PaymentStatus, PurchaseStatus, SubscriptionStatus } from "@/generated/prisma/client";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const accessDuration = 30 * 24 * 60 * 60 * 1000;

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function subscriptionMonths(plan: "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS") {
  return plan === "ONE_MONTH" ? 1 : plan === "THREE_MONTHS" ? 3 : 6;
}

function revalidatePayments() {
  revalidatePath("/admin/payments");
  revalidatePath("/dashboard");
}

export async function confirmPayment(paymentId: string) {
  if (!await getCurrentAdmin()) throw new Error("Unauthorized");
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const payment = await transaction.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status !== PaymentStatus.PENDING || payment.provider !== "whatsapp") throw new Error("This payment is not awaiting WhatsApp confirmation.");
    if (!payment.accessType || !payment.accessId) throw new Error("The payment has no linked access record.");

    await transaction.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.SUCCESS } });
    const accessWhere = { id: payment.accessId, userId: payment.userId };

    switch (payment.accessType) {
      case PaymentAccessType.COURSE:
        await transaction.coursePurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.COMPLETED, expiresAt: new Date(now.getTime() + accessDuration) } });
        break;
      case PaymentAccessType.MODULE:
        await transaction.modulePurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.COMPLETED, expiresAt: new Date(now.getTime() + accessDuration) } });
        break;
      case PaymentAccessType.BOOK:
        await transaction.bookPurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.COMPLETED, purchasedAt: now } });
        break;
      case PaymentAccessType.SUBSCRIPTION: {
        const subscription = await transaction.subscription.findFirst({ where: accessWhere, select: { plan: true } });
        if (!subscription) throw new Error("The subscription request no longer exists.");
        await transaction.subscription.updateMany({ where: accessWhere, data: { status: SubscriptionStatus.ACTIVE, startsAt: now, expiresAt: addMonths(now, subscriptionMonths(subscription.plan)) } });
        break;
      }
      case PaymentAccessType.VIDEO:
        await transaction.videoPurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.COMPLETED, expiresAt: new Date(now.getTime() + accessDuration) } });
        break;
    }
  });

  revalidatePayments();
}

export async function rejectPayment(paymentId: string, formData: FormData) {
  if (!await getCurrentAdmin()) throw new Error("Unauthorized");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const payment = await transaction.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status !== PaymentStatus.PENDING || payment.provider !== "whatsapp") throw new Error("This payment is not awaiting WhatsApp confirmation.");
    if (!payment.accessType || !payment.accessId) throw new Error("The payment has no linked access record.");

    await transaction.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.FAILED, refundReason: reason || null } });
    const accessWhere = { id: payment.accessId, userId: payment.userId };
    switch (payment.accessType) {
      case PaymentAccessType.COURSE:
        await transaction.coursePurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.FAILED, expiresAt: now } });
        break;
      case PaymentAccessType.MODULE:
        await transaction.modulePurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.FAILED, expiresAt: now } });
        break;
      case PaymentAccessType.BOOK:
        await transaction.bookPurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.FAILED } });
        break;
      case PaymentAccessType.SUBSCRIPTION:
        await transaction.subscription.updateMany({ where: accessWhere, data: { status: SubscriptionStatus.CANCELLED, expiresAt: now } });
        break;
      case PaymentAccessType.VIDEO:
        await transaction.videoPurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.FAILED, expiresAt: now } });
        break;
    }
  });

  revalidatePayments();
}

export async function refundPayment(paymentId: string, formData: FormData) {
  if (!await getCurrentAdmin()) throw new Error("Unauthorized");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const payment = await transaction.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status !== PaymentStatus.SUCCESS) throw new Error("This payment cannot be refunded.");
    if (!payment.accessType || !payment.accessId) throw new Error("This legacy payment is not linked to access and cannot be refunded safely.");

    await transaction.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.REFUNDED, refundedAt: now, refundReason: reason || null } });
    const accessWhere = { id: payment.accessId, userId: payment.userId };
    switch (payment.accessType) {
      case PaymentAccessType.COURSE:
        await transaction.coursePurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.REFUNDED, expiresAt: now } });
        break;
      case PaymentAccessType.MODULE:
        await transaction.modulePurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.REFUNDED, expiresAt: now } });
        break;
      case PaymentAccessType.BOOK:
        await transaction.bookPurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.REFUNDED } });
        break;
      case PaymentAccessType.VIDEO:
        await transaction.videoPurchase.updateMany({ where: accessWhere, data: { status: PurchaseStatus.REFUNDED, expiresAt: now } });
        break;
      case PaymentAccessType.SUBSCRIPTION:
        await transaction.subscription.updateMany({ where: accessWhere, data: { status: SubscriptionStatus.CANCELLED, expiresAt: now } });
        break;
    }
  });

  revalidatePayments();
}
