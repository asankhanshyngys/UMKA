import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasLessonAccess, scorePractice } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  const practice = await prisma.practice.findUnique({
    where: { id },
    include: { video: { include: { module: { select: { courseId: true } } } }, sections: { include: { questions: { include: { answers: true } } } } },
  });
  if (!practice?.video) return NextResponse.json({ error: "Practice not found." }, { status: 404 });

  if (user.role !== "ADMIN") {
    const now = new Date();
    const [subscription, purchase, modulePurchase, videoPurchase] = await Promise.all([
      prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: now } } }),
      prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: practice.video.module.courseId, status: "COMPLETED", expiresAt: { gt: now } } }),
      prisma.modulePurchase.findFirst({ where: { userId: user.id, moduleId: practice.video.moduleId, status: "COMPLETED", expiresAt: { gt: now } } }),
      prisma.videoPurchase.findFirst({ where: { userId: user.id, videoId: practice.videoId!, status: "COMPLETED", expiresAt: { gt: now } } }),
    ]);
    if (!hasLessonAccess({ isAdmin: false, hasSubscription: Boolean(subscription), hasCoursePurchase: Boolean(purchase), hasModulePurchase: Boolean(modulePurchase), hasVideoPurchase: Boolean(videoPurchase) })) return NextResponse.json({ error: "Course, module, or lesson access required." }, { status: 403 });

    const courseVideos = await prisma.video.findMany({
      where: { deletedAt: null, module: { deletedAt: null, ...(modulePurchase ? { id: practice.video.moduleId } : { courseId: practice.video.module.courseId }) } },
      select: { id: true, practices: { select: { id: true } } },
      orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    });
    const position = courseVideos.findIndex((video) => video.id === practice.videoId);
    const requiredPracticeIds = position > 0 ? courseVideos[position - 1].practices.map((previousPractice) => previousPractice.id) : [];
    if (requiredPracticeIds.length > 0 && !videoPurchase) {
      const completed = await prisma.practiceResult.count({ where: { userId: user.id, completed: true, practiceId: { in: requiredPracticeIds } } });
      if (completed !== requiredPracticeIds.length) return NextResponse.json({ error: "Complete the previous lesson's practice first." }, { status: 403 });
    }
  }

  const body = await request.json() as { answers?: Record<string, string> };
  const answers = body.answers ?? {};
  const result = scorePractice(practice.sections.flatMap((section) => section.questions), answers);

  await prisma.practiceResult.upsert({
    where: { userId_practiceId: { userId: user.id, practiceId: practice.id } },
    update: { score: result.score, completed: true },
    create: { userId: user.id, practiceId: practice.id, score: result.score, completed: true },
  });
  return NextResponse.json({ ...result, completed: true });
}
