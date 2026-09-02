import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const courseInclude = {
  instructor: true,
  category: true,
  modules: {
    where: { deletedAt: null },
    orderBy: { order: "asc" as const },
    include: { videos: { where: { deletedAt: null }, orderBy: { order: "asc" as const }, include: { practices: { select: { id: true } } } } },
  },
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const subscription = user.role === "ADMIN" ? null : await prisma.subscription.findFirst({
    where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: now } },
  });

  const hasFullCatalogAccess = user.role === "ADMIN" || Boolean(subscription);
  const courses = await prisma.course.findMany({
    where: hasFullCatalogAccess
      ? { status: "PUBLISHED", deletedAt: null }
      : {
          status: "PUBLISHED",
          deletedAt: null,
          purchases: { some: { userId: user.id, status: "COMPLETED", expiresAt: { gt: now } } },
        },
    include: courseInclude,
    orderBy: { createdAt: "desc" },
  });

  const practiceIds = courses.flatMap((course) => course.modules.flatMap((module) => module.videos.flatMap((video) => video.practices.map((practice) => practice.id))));
  const courseVideoIds = courses.flatMap((course) => course.modules.flatMap((module) => module.videos.map((video) => video.id)));
  const completedVideoRows = courseVideoIds.length === 0 ? [] : await prisma.videoProgress.findMany({ where: { userId: user.id, completed: true, videoId: { in: courseVideoIds } }, select: { videoId: true } });
  const completedVideoIds = new Set(completedVideoRows.map((row) => row.videoId));
  const results = practiceIds.length === 0 ? [] : await prisma.practiceResult.findMany({ where: { userId: user.id, completed: true, practiceId: { in: practiceIds } }, select: { practiceId: true, score: true } });
  const resultByPracticeId = new Map(results.map((result) => [result.practiceId, result]));
  const coursesWithProgress = courses.map((course) => {
    const coursePracticeIds = course.modules.flatMap((module) => module.videos.flatMap((video) => video.practices.map((practice) => practice.id)));
    const completed = coursePracticeIds.map((practiceId) => resultByPracticeId.get(practiceId)).filter((result): result is { practiceId: string; score: number } => Boolean(result));
    const courseVideos = course.modules.flatMap((module) => module.videos);
    return { ...course, progress: { totalVideos: courseVideos.length, completedVideos: courseVideos.filter((video) => completedVideoIds.has(video.id)).length, totalPractices: coursePracticeIds.length, completedPractices: completed.length, averageScore: completed.length === 0 ? null : Math.round(completed.reduce((sum, result) => sum + result.score, 0) / completed.length) } };
  });
  const standalonePurchases = user.role === "ADMIN" ? [] : await prisma.videoPurchase.findMany({
    where: { userId: user.id, status: "COMPLETED", expiresAt: { gt: now }, video: { deletedAt: null, module: { deletedAt: null, course: { status: "PUBLISHED", deletedAt: null } } } },
    include: { video: { include: { module: { include: { course: true } }, practices: { select: { id: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  const standalonePracticeIds = standalonePurchases.flatMap((purchase) => purchase.video.practices.map((practice) => practice.id));
  const standaloneResults = standalonePracticeIds.length === 0 ? [] : await prisma.practiceResult.findMany({ where: { userId: user.id, completed: true, practiceId: { in: standalonePracticeIds } }, select: { practiceId: true, score: true } });
  const standaloneResultByPracticeId = new Map(standaloneResults.map((result) => [result.practiceId, result]));
  const standaloneLessons = standalonePurchases.map((purchase) => {
    const completed = purchase.video.practices.map((practice) => standaloneResultByPracticeId.get(practice.id)).filter((result): result is { practiceId: string; score: number } => Boolean(result));
    return { id: purchase.video.id, title: purchase.video.title, duration: purchase.video.duration, course: { id: purchase.video.module.course.id, title: purchase.video.module.course.title }, expiresAt: purchase.expiresAt, progress: { totalPractices: purchase.video.practices.length, completedPractices: completed.length, averageScore: completed.length === 0 ? null : Math.round(completed.reduce((sum, result) => sum + result.score, 0) / completed.length) } };
  });
  const modulePurchases = user.role === "ADMIN" ? [] : await prisma.modulePurchase.findMany({
    where: { userId: user.id, status: "COMPLETED", expiresAt: { gt: now }, module: { deletedAt: null, course: { status: "PUBLISHED", deletedAt: null } } },
    include: { module: { include: { course: true, videos: { where: { deletedAt: null }, include: { practices: { select: { id: true } } } } } } },
    orderBy: { createdAt: "desc" },
  });
  const modulePracticeIds = modulePurchases.flatMap((purchase) => purchase.module.videos.flatMap((video) => video.practices.map((practice) => practice.id)));
  const moduleResults = modulePracticeIds.length === 0 ? [] : await prisma.practiceResult.findMany({ where: { userId: user.id, completed: true, practiceId: { in: modulePracticeIds } }, select: { practiceId: true, score: true } });
  const moduleResultByPracticeId = new Map(moduleResults.map((result) => [result.practiceId, result]));
  const purchasedModules = modulePurchases.map((purchase) => {
    const practices = purchase.module.videos.flatMap((video) => video.practices);
    const completed = practices.map((practice) => moduleResultByPracticeId.get(practice.id)).filter((result): result is { practiceId: string; score: number } => Boolean(result));
    return { id: purchase.module.id, title: purchase.module.title, course: { id: purchase.module.course.id, title: purchase.module.course.title }, expiresAt: purchase.expiresAt, progress: { totalPractices: practices.length, completedPractices: completed.length, averageScore: completed.length === 0 ? null : Math.round(completed.reduce((sum, result) => sum + result.score, 0) / completed.length) } };
  });
  const books = user.role === "ADMIN" ? [] : await prisma.bookPurchase.findMany({
    where: { userId: user.id, status: "COMPLETED", book: { deletedAt: null } },
    select: { book: { select: { id: true, title: true, author: true, coverImageKey: true } } },
    orderBy: { purchasedAt: "desc" },
  });
  const pendingPayments = user.role === "ADMIN" ? [] : await prisma.payment.findMany({
    where: { userId: user.id, status: "PENDING", provider: "whatsapp" },
    select: { accessType: true, accessId: true, referenceCode: true },
  });
  const pendingAccessIds = pendingPayments.flatMap((payment) => payment.accessId ? [payment.accessId] : []);
  const [pendingCourses, pendingModules, pendingBooks, pendingSubscriptions] = user.role === "ADMIN" ? [[], [], [], []] : await Promise.all([
    prisma.coursePurchase.findMany({ where: { id: { in: pendingAccessIds }, userId: user.id, status: "PENDING" }, include: { course: { select: { title: true } } } }),
    prisma.modulePurchase.findMany({ where: { id: { in: pendingAccessIds }, userId: user.id, status: "PENDING" }, include: { module: { include: { course: { select: { title: true } } } } } }),
    prisma.bookPurchase.findMany({ where: { id: { in: pendingAccessIds }, userId: user.id, status: "PENDING" }, include: { book: { select: { title: true } } } }),
    prisma.subscription.findMany({ where: { id: { in: pendingAccessIds }, userId: user.id, status: "PENDING" }, select: { id: true, plan: true } }),
  ]);
  const pendingReferenceByAccessId = new Map(pendingPayments.map((payment) => [payment.accessId, payment.referenceCode]));
  const pendingRequests = [
    ...pendingCourses.map((purchase) => ({ id: purchase.id, title: purchase.course.title, referenceCode: pendingReferenceByAccessId.get(purchase.id) })),
    ...pendingModules.map((purchase) => ({ id: purchase.id, title: `${purchase.module.course.title} — ${purchase.module.title}`, referenceCode: pendingReferenceByAccessId.get(purchase.id) })),
    ...pendingBooks.map((purchase) => ({ id: purchase.id, title: purchase.book.title, referenceCode: pendingReferenceByAccessId.get(purchase.id) })),
    ...pendingSubscriptions.map((subscription) => ({ id: subscription.id, title: `Subscription: ${subscription.plan.replaceAll("_", " ")}`, referenceCode: pendingReferenceByAccessId.get(subscription.id) })),
  ].filter((request): request is { id: string; title: string; referenceCode: string } => Boolean(request.referenceCode));
  return NextResponse.json({ courses: coursesWithProgress, standaloneLessons, purchasedModules, books: books.map(({ book }) => book), pendingRequests });
}
