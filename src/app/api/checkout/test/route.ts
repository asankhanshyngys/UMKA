import { NextResponse } from "next/server";
import { PaymentAccessType, PurchaseStatus, SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CheckoutRequest =
  | { type: "course"; courseId: string }
  | { type: "module"; moduleId: string }
  | { type: "video"; videoId: string }
  | { type: "subscription"; months: 1 | 3 | 6 };

const planByMonths = {
  1: SubscriptionPlan.ONE_MONTH,
  3: SubscriptionPlan.THREE_MONTHS,
  6: SubscriptionPlan.SIX_MONTHS,
} as const;

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Test checkout is disabled in production." }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in before checkout." }, { status: 401 });
  if (user.role !== "ADMIN" && !user.emailVerifiedAt) {
    return NextResponse.json({ error: "Verify your email address before activating a subscription or purchase." }, { status: 403 });
  }

  let body: CheckoutRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const now = new Date();

  if (body.type === "course" && typeof body.courseId === "string") {
    const course = await prisma.course.findFirst({ where: { id: body.courseId, status: "PUBLISHED", deletedAt: null } });
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
    const activeSubscription = await prisma.subscription.findFirst({ where: { userId: user.id, status: SubscriptionStatus.ACTIVE, expiresAt: { gt: now } } });
    if (activeSubscription) return NextResponse.json({ message: "Your active subscription already includes this course." });

    const currentPurchase = await prisma.coursePurchase.findFirst({
      where: { userId: user.id, courseId: course.id, status: PurchaseStatus.COMPLETED, expiresAt: { gt: now } },
    });
    if (currentPurchase) return NextResponse.json({ message: "You already have access." });

    await prisma.$transaction(async (transaction) => {
      const purchase = await transaction.coursePurchase.create({ data: { userId: user.id, courseId: course.id, price: course.price, status: PurchaseStatus.COMPLETED, expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) } });
      await transaction.payment.create({ data: { userId: user.id, amount: course.price, status: "SUCCESS", provider: "TEST", transactionId: `test-course-${course.id}-${now.getTime()}`, accessType: PaymentAccessType.COURSE, accessId: purchase.id } });
    });
    return NextResponse.json({ message: "Test course access granted." }, { status: 201 });
  }

  if (body.type === "video" && typeof body.videoId === "string") {
    const video = await prisma.video.findFirst({ where: { id: body.videoId, deletedAt: null, module: { deletedAt: null, course: { status: "PUBLISHED", deletedAt: null } } }, select: { id: true, title: true, price: true, moduleId: true, module: { select: { courseId: true } } } });
    if (!video) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    const [activeSubscription, coursePurchase, modulePurchase] = await Promise.all([
      prisma.subscription.findFirst({ where: { userId: user.id, status: SubscriptionStatus.ACTIVE, expiresAt: { gt: now } } }),
      prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: video.module.courseId, status: PurchaseStatus.COMPLETED, expiresAt: { gt: now } } }),
      prisma.modulePurchase.findFirst({ where: { userId: user.id, moduleId: video.moduleId, status: PurchaseStatus.COMPLETED, expiresAt: { gt: now } } }),
    ]);
    if (activeSubscription || coursePurchase || modulePurchase) return NextResponse.json({ message: "Your existing access already includes this lesson." });
    const currentPurchase = await prisma.videoPurchase.findFirst({ where: { userId: user.id, videoId: video.id, status: PurchaseStatus.COMPLETED, expiresAt: { gt: now } } });
    if (currentPurchase) return NextResponse.json({ message: "You already have access to this lesson." });
    await prisma.$transaction(async (transaction) => {
      const purchase = await transaction.videoPurchase.create({ data: { userId: user.id, videoId: video.id, price: video.price, status: PurchaseStatus.COMPLETED, expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) } });
      await transaction.payment.create({ data: { userId: user.id, amount: video.price, status: "SUCCESS", provider: "TEST", transactionId: `test-video-${video.id}-${now.getTime()}`, accessType: PaymentAccessType.VIDEO, accessId: purchase.id } });
    });
    return NextResponse.json({ message: "Test lesson access granted." }, { status: 201 });
  }

  if (body.type === "module" && typeof body.moduleId === "string") {
    const courseModule = await prisma.module.findFirst({ where: { id: body.moduleId, deletedAt: null, course: { status: "PUBLISHED", deletedAt: null } }, select: { id: true, price: true, courseId: true } });
    if (!courseModule) return NextResponse.json({ error: "Module not found." }, { status: 404 });
    const [activeSubscription, coursePurchase] = await Promise.all([
      prisma.subscription.findFirst({ where: { userId: user.id, status: SubscriptionStatus.ACTIVE, expiresAt: { gt: now } } }),
      prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: courseModule.courseId, status: PurchaseStatus.COMPLETED, expiresAt: { gt: now } } }),
    ]);
    if (activeSubscription || coursePurchase) return NextResponse.json({ message: "Your existing access already includes this module." });
    const currentPurchase = await prisma.modulePurchase.findFirst({ where: { userId: user.id, moduleId: courseModule.id, status: PurchaseStatus.COMPLETED, expiresAt: { gt: now } } });
    if (currentPurchase) return NextResponse.json({ message: "You already have access to this module." });
    await prisma.$transaction(async (transaction) => {
      const purchase = await transaction.modulePurchase.create({ data: { userId: user.id, moduleId: courseModule.id, price: courseModule.price, status: PurchaseStatus.COMPLETED, expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) } });
      await transaction.payment.create({ data: { userId: user.id, amount: courseModule.price, status: "SUCCESS", provider: "TEST", transactionId: `test-module-${courseModule.id}-${now.getTime()}`, accessType: PaymentAccessType.MODULE, accessId: purchase.id } });
    });
    return NextResponse.json({ message: "Test module access granted." }, { status: 201 });
  }

  if (body.type === "subscription" && (body.months === 1 || body.months === 3 || body.months === 6)) {
    const settings = await prisma.platformSettings.findFirst();
    if (!settings) return NextResponse.json({ error: "Subscription pricing has not been configured." }, { status: 503 });

    const priceByMonths = { 1: settings.oneMonthSubscription, 3: settings.threeMonthSubscription, 6: settings.sixMonthSubscription };
    const activeSubscription = await prisma.subscription.findFirst({ where: { userId: user.id, status: SubscriptionStatus.ACTIVE, expiresAt: { gt: now }, }, orderBy: { expiresAt: "desc" } });
    const startsAt = activeSubscription?.expiresAt ?? now;
    const expiresAt = new Date(startsAt);
    expiresAt.setMonth(expiresAt.getMonth() + body.months);
    const price = priceByMonths[body.months];

    await prisma.$transaction(async (transaction) => {
      const subscription = activeSubscription
        ? await transaction.subscription.update({ where: { id: activeSubscription.id }, data: { plan: planByMonths[body.months], price, expiresAt } })
        : await transaction.subscription.create({ data: { userId: user.id, plan: planByMonths[body.months], price, status: SubscriptionStatus.ACTIVE, startsAt, expiresAt } });
      await transaction.payment.create({ data: { userId: user.id, amount: price, status: "SUCCESS", provider: "TEST", transactionId: `test-subscription-${user.id}-${now.getTime()}`, accessType: PaymentAccessType.SUBSCRIPTION, accessId: subscription.id } });
    });
    return NextResponse.json({ message: "Test subscription activated." }, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
}
