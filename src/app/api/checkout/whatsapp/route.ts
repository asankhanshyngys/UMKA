import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  PaymentAccessType,
  PaymentStatus,
  PurchaseStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlatformSettings } from "@/lib/platform-settings";

type CheckoutRequest =
  | { type: "course"; courseId: string }
  | { type: "module"; moduleId: string }
  | { type: "book"; bookId: string }
  | { type: "subscription"; months: 1 | 3 | 6 };

const planByMonths = {
  1: SubscriptionPlan.ONE_MONTH,
  3: SubscriptionPlan.THREE_MONTHS,
  6: SubscriptionPlan.SIX_MONTHS,
} as const;

const monthByPlan = {
  [SubscriptionPlan.ONE_MONTH]: 1,
  [SubscriptionPlan.THREE_MONTHS]: 3,
  [SubscriptionPlan.SIX_MONTHS]: 6,
} as const;

function createReferenceCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

function buildWhatsAppLink(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function buildMessage({
  referenceCode,
  item,
  price,
  user,
}: {
  referenceCode: string;
  item: string;
  price: number;
  user: { name: string; email: string };
}) {
  return [
    "Здравствуйте! Хочу оформить покупку в UMKA.",
    `Код заявки: ${referenceCode}`,
    `Товар: ${item}`,
    `Сумма: ${price.toLocaleString("ru-RU")} ₸`,
    `Покупатель: ${user.name} (${user.email})`,
  ].join("\n");
}

async function createPendingPayment({
  userId,
  amount,
  accessType,
  accessId,
}: {
  userId: string;
  amount: number;
  accessType: PaymentAccessType;
  accessId: string;
}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referenceCode = createReferenceCode();
    try {
      return await prisma.payment.create({
        data: {
          userId,
          amount,
          status: PaymentStatus.PENDING,
          provider: "whatsapp",
          referenceCode,
          accessType,
          accessId,
        },
      });
    } catch (error) {
      if (!(typeof error === "object" && error && "code" in error && error.code === "P2002")) throw error;
    }
  }

  throw new Error("Could not generate a unique payment reference.");
}

async function pendingPayment(userId: string, accessType: PaymentAccessType, accessId: string) {
  return prisma.payment.findFirst({
    where: { userId, status: PaymentStatus.PENDING, provider: "whatsapp", accessType, accessId },
    orderBy: { createdAt: "desc" },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in before checkout." }, { status: 401 });
  if (user.role !== "ADMIN" && !user.emailVerifiedAt) {
    return NextResponse.json({ error: "Verify your email address before submitting a payment request." }, { status: 403 });
  }

  let body: CheckoutRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const settings = await getPlatformSettings();
  const whatsappNumber = settings?.whatsappNumber?.replace(/\D/g, "");
  if (!whatsappNumber || whatsappNumber.length < 8) {
    return NextResponse.json({ error: "WhatsApp payments are not configured yet. Please contact the administrator." }, { status: 503 });
  }

  const now = new Date();
  const activeSubscription = await prisma.subscription.findFirst({
    where: { userId: user.id, status: SubscriptionStatus.ACTIVE, expiresAt: { gt: now } },
  });

  if (body.type === "course") {
    const course = await prisma.course.findFirst({ where: { id: body.courseId, status: "PUBLISHED", deletedAt: null } });
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
    const completed = await prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: course.id, status: PurchaseStatus.COMPLETED, expiresAt: { gt: now } } });
    if (activeSubscription || completed || user.role === "ADMIN") return NextResponse.json({ error: "You already have access to this course." }, { status: 409 });

    const pendingPurchase = await prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: course.id, status: PurchaseStatus.PENDING }, orderBy: { createdAt: "desc" } });
    const payment = pendingPurchase
      ? (await pendingPayment(user.id, PaymentAccessType.COURSE, pendingPurchase.id)) ?? await createPendingPayment({ userId: user.id, amount: course.price, accessType: PaymentAccessType.COURSE, accessId: pendingPurchase.id })
      : await prisma.$transaction(async (transaction) => {
          const purchase = await transaction.coursePurchase.create({ data: { userId: user.id, courseId: course.id, price: course.price, status: PurchaseStatus.PENDING, expiresAt: now } });
          const referenceCode = createReferenceCode();
          return transaction.payment.create({ data: { userId: user.id, amount: course.price, status: PaymentStatus.PENDING, provider: "whatsapp", referenceCode, accessType: PaymentAccessType.COURSE, accessId: purchase.id } });
        });

    return NextResponse.json({ referenceCode: payment.referenceCode, waLink: buildWhatsAppLink(whatsappNumber, buildMessage({ referenceCode: payment.referenceCode, item: `Курс: ${course.title}`, price: course.price, user })) });
  }

  if (body.type === "module") {
    const courseModule = await prisma.module.findFirst({ where: { id: body.moduleId, deletedAt: null, course: { status: "PUBLISHED", deletedAt: null } }, include: { course: { select: { title: true } } } });
    if (!courseModule) return NextResponse.json({ error: "Module not found." }, { status: 404 });
    const [coursePurchase, completed] = await Promise.all([
      prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: courseModule.courseId, status: PurchaseStatus.COMPLETED, expiresAt: { gt: now } } }),
      prisma.modulePurchase.findFirst({ where: { userId: user.id, moduleId: courseModule.id, status: PurchaseStatus.COMPLETED, expiresAt: { gt: now } } }),
    ]);
    if (activeSubscription || coursePurchase || completed || user.role === "ADMIN") return NextResponse.json({ error: "You already have access to this module." }, { status: 409 });

    const pendingPurchase = await prisma.modulePurchase.findFirst({ where: { userId: user.id, moduleId: courseModule.id, status: PurchaseStatus.PENDING }, orderBy: { createdAt: "desc" } });
    const payment = pendingPurchase
      ? (await pendingPayment(user.id, PaymentAccessType.MODULE, pendingPurchase.id)) ?? await createPendingPayment({ userId: user.id, amount: courseModule.price, accessType: PaymentAccessType.MODULE, accessId: pendingPurchase.id })
      : await prisma.$transaction(async (transaction) => {
          const purchase = await transaction.modulePurchase.create({ data: { userId: user.id, moduleId: courseModule.id, price: courseModule.price, status: PurchaseStatus.PENDING, expiresAt: now } });
          const referenceCode = createReferenceCode();
          return transaction.payment.create({ data: { userId: user.id, amount: courseModule.price, status: PaymentStatus.PENDING, provider: "whatsapp", referenceCode, accessType: PaymentAccessType.MODULE, accessId: purchase.id } });
        });

    return NextResponse.json({ referenceCode: payment.referenceCode, waLink: buildWhatsAppLink(whatsappNumber, buildMessage({ referenceCode: payment.referenceCode, item: `Модуль: ${courseModule.course.title} — ${courseModule.title}`, price: courseModule.price, user })) });
  }

  if (body.type === "book") {
    const book = await prisma.book.findFirst({ where: { id: body.bookId, status: "PUBLISHED", deletedAt: null } });
    if (!book) return NextResponse.json({ error: "Book not found." }, { status: 404 });
    const existing = await prisma.bookPurchase.findUnique({ where: { userId_bookId: { userId: user.id, bookId: book.id } } });
    if (existing?.status === PurchaseStatus.COMPLETED || user.role === "ADMIN") return NextResponse.json({ error: "You already own this book." }, { status: 409 });

    const payment = existing?.status === PurchaseStatus.PENDING
      ? (await pendingPayment(user.id, PaymentAccessType.BOOK, existing.id)) ?? await createPendingPayment({ userId: user.id, amount: book.price, accessType: PaymentAccessType.BOOK, accessId: existing.id })
      : await prisma.$transaction(async (transaction) => {
          const purchase = existing
            ? await transaction.bookPurchase.update({ where: { id: existing.id }, data: { pricePaid: book.price, status: PurchaseStatus.PENDING, purchasedAt: now } })
            : await transaction.bookPurchase.create({ data: { userId: user.id, bookId: book.id, pricePaid: book.price, status: PurchaseStatus.PENDING } });
          const referenceCode = createReferenceCode();
          return transaction.payment.create({ data: { userId: user.id, amount: book.price, status: PaymentStatus.PENDING, provider: "whatsapp", referenceCode, accessType: PaymentAccessType.BOOK, accessId: purchase.id } });
        });

    return NextResponse.json({ referenceCode: payment.referenceCode, waLink: buildWhatsAppLink(whatsappNumber, buildMessage({ referenceCode: payment.referenceCode, item: `Книга: ${book.title}`, price: book.price, user })) });
  }

  if (body.type === "subscription" && (body.months === 1 || body.months === 3 || body.months === 6)) {
    if (activeSubscription || user.role === "ADMIN") return NextResponse.json({ error: "You already have an active subscription." }, { status: 409 });
    if (!settings) return NextResponse.json({ error: "Subscription pricing has not been configured." }, { status: 503 });
    const priceByMonths = { 1: settings.oneMonthSubscription, 3: settings.threeMonthSubscription, 6: settings.sixMonthSubscription };
    const plan = planByMonths[body.months];
    const pendingSubscription = await prisma.subscription.findFirst({ where: { userId: user.id, plan, status: SubscriptionStatus.PENDING }, orderBy: { createdAt: "desc" } });
    const payment = pendingSubscription
      ? (await pendingPayment(user.id, PaymentAccessType.SUBSCRIPTION, pendingSubscription.id)) ?? await createPendingPayment({ userId: user.id, amount: priceByMonths[body.months], accessType: PaymentAccessType.SUBSCRIPTION, accessId: pendingSubscription.id })
      : await prisma.$transaction(async (transaction) => {
          const subscription = await transaction.subscription.create({ data: { userId: user.id, plan, price: priceByMonths[body.months], status: SubscriptionStatus.PENDING, startsAt: now, expiresAt: now } });
          const referenceCode = createReferenceCode();
          return transaction.payment.create({ data: { userId: user.id, amount: priceByMonths[body.months], status: PaymentStatus.PENDING, provider: "whatsapp", referenceCode, accessType: PaymentAccessType.SUBSCRIPTION, accessId: subscription.id } });
        });

    return NextResponse.json({ referenceCode: payment.referenceCode, waLink: buildWhatsAppLink(whatsappNumber, buildMessage({ referenceCode: payment.referenceCode, item: `Подписка на ${monthByPlan[plan]} мес.`, price: priceByMonths[body.months], user })) });
  }

  return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
}
