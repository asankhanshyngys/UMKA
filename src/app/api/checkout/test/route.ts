import { NextResponse } from "next/server";
import { PaymentAccessType, PurchaseStatus, SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlatformSettings } from "@/lib/platform-settings";

type CheckoutRequest =
  | { type: "course"; courseId: string }
  | { type: "module"; moduleId: string }
  | { type: "book"; bookId: string }
  | { type: "subscription"; months: 1 | 3 | 6 };

const planByMonths = { 1: SubscriptionPlan.ONE_MONTH, 3: SubscriptionPlan.THREE_MONTHS, 6: SubscriptionPlan.SIX_MONTHS } as const;
const accessDuration = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Test checkout is disabled in production." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in before checkout." }, { status: 401 });
  if (user.role !== "ADMIN" && !user.emailVerifiedAt) return NextResponse.json({ error: "Verify your email address before activating a subscription or purchase." }, { status: 403 });

  let body: CheckoutRequest;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 }); }
  const now = new Date();

  if (body.type === "course") {
    const course = await prisma.course.findFirst({ where: { id: body.courseId, status: "PUBLISHED", deletedAt: null } });
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
    const existing = await prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: course.id, status: PurchaseStatus.COMPLETED, expiresAt: { gt: now } } });
    if (existing) return NextResponse.json({ message: "You already have access." });
    await prisma.$transaction(async (tx) => {
      const purchase = await tx.coursePurchase.create({ data: { userId: user.id, courseId: course.id, price: course.price, status: PurchaseStatus.COMPLETED, expiresAt: new Date(now.getTime() + accessDuration) } });
      await tx.payment.create({ data: { userId: user.id, amount: course.price, status: "SUCCESS", provider: "TEST", transactionId: `test-course-${course.id}-${now.getTime()}`, referenceCode: `TEST-${now.getTime()}`, accessType: PaymentAccessType.COURSE, accessId: purchase.id } });
    });
    return NextResponse.json({ message: "Test course access granted." }, { status: 201 });
  }

  if (body.type === "module") {
    const courseModule = await prisma.module.findFirst({ where: { id: body.moduleId, deletedAt: null, course: { status: "PUBLISHED", deletedAt: null } } });
    if (!courseModule) return NextResponse.json({ error: "Module not found." }, { status: 404 });
    const existing = await prisma.modulePurchase.findFirst({ where: { userId: user.id, moduleId: courseModule.id, status: PurchaseStatus.COMPLETED, expiresAt: { gt: now } } });
    if (existing) return NextResponse.json({ message: "You already have access." });
    await prisma.$transaction(async (tx) => {
      const purchase = await tx.modulePurchase.create({ data: { userId: user.id, moduleId: courseModule.id, price: courseModule.price, status: PurchaseStatus.COMPLETED, expiresAt: new Date(now.getTime() + accessDuration) } });
      await tx.payment.create({ data: { userId: user.id, amount: courseModule.price, status: "SUCCESS", provider: "TEST", transactionId: `test-module-${courseModule.id}-${now.getTime()}`, referenceCode: `TEST-${now.getTime()}`, accessType: PaymentAccessType.MODULE, accessId: purchase.id } });
    });
    return NextResponse.json({ message: "Test module access granted." }, { status: 201 });
  }

  if (body.type === "book") {
    const book = await prisma.book.findFirst({ where: { id: body.bookId, status: "PUBLISHED", deletedAt: null } });
    if (!book) return NextResponse.json({ error: "Book not found." }, { status: 404 });
    const existing = await prisma.bookPurchase.findFirst({ where: { userId: user.id, bookId: book.id, status: PurchaseStatus.COMPLETED } });
    if (existing) return NextResponse.json({ message: "You already own this book." });
    await prisma.$transaction(async (tx) => {
      const purchase = await tx.bookPurchase.create({ data: { userId: user.id, bookId: book.id, pricePaid: book.price, status: PurchaseStatus.COMPLETED } });
      await tx.payment.create({ data: { userId: user.id, amount: book.price, status: "SUCCESS", provider: "TEST", transactionId: `test-book-${book.id}-${now.getTime()}`, referenceCode: `TEST-${now.getTime()}`, accessType: PaymentAccessType.BOOK, accessId: purchase.id } });
    });
    return NextResponse.json({ message: "Test book purchase completed." }, { status: 201 });
  }

  if (body.type === "subscription" && (body.months === 1 || body.months === 3 || body.months === 6)) {
    const settings = await getPlatformSettings();
    if (!settings) return NextResponse.json({ error: "Subscription pricing has not been configured." }, { status: 503 });
    const prices = { 1: settings.oneMonthSubscription, 3: settings.threeMonthSubscription, 6: settings.sixMonthSubscription };
    const active = await prisma.subscription.findFirst({ where: { userId: user.id, status: SubscriptionStatus.ACTIVE, expiresAt: { gt: now } }, orderBy: { expiresAt: "desc" } });
    const startsAt = active?.expiresAt ?? now;
    const expiresAt = new Date(startsAt); expiresAt.setMonth(expiresAt.getMonth() + body.months);
    const subscription = active ? await prisma.subscription.update({ where: { id: active.id }, data: { plan: planByMonths[body.months], price: prices[body.months], expiresAt } }) : await prisma.subscription.create({ data: { userId: user.id, plan: planByMonths[body.months], price: prices[body.months], status: SubscriptionStatus.ACTIVE, startsAt, expiresAt } });
    await prisma.payment.create({ data: { userId: user.id, amount: prices[body.months], status: "SUCCESS", provider: "TEST", transactionId: `test-subscription-${user.id}-${now.getTime()}`, referenceCode: `TEST-${now.getTime()}`, accessType: PaymentAccessType.SUBSCRIPTION, accessId: subscription.id } });
    return NextResponse.json({ message: "Test subscription activated." }, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
}
