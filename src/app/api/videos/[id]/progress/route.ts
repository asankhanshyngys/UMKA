import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasLessonAccess } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  const video = await prisma.video.findFirst({ where: { id, deletedAt: null }, select: { id: true, duration: true, moduleId: true, module: { select: { courseId: true } } } });
  if (!video) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  if (user.role !== "ADMIN") {
    const now = new Date();
    const [subscription, coursePurchase, modulePurchase, videoPurchase] = await Promise.all([
      prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: now } } }),
      prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: video.module.courseId, status: "COMPLETED", expiresAt: { gt: now } } }),
      prisma.modulePurchase.findFirst({ where: { userId: user.id, moduleId: video.moduleId, status: "COMPLETED", expiresAt: { gt: now } } }),
      prisma.videoPurchase.findFirst({ where: { userId: user.id, videoId: video.id, status: "COMPLETED", expiresAt: { gt: now } } }),
    ]);
    if (!hasLessonAccess({ isAdmin: false, hasSubscription: Boolean(subscription), hasCoursePurchase: Boolean(coursePurchase), hasModulePurchase: Boolean(modulePurchase), hasVideoPurchase: Boolean(videoPurchase) })) return NextResponse.json({ error: "Lesson access required." }, { status: 403 });
  }
  const body = await request.json().catch(() => ({})) as { position?: unknown; completed?: unknown };
  const position = typeof body.position === "number" && Number.isFinite(body.position) ? Math.max(0, Math.min(Math.round(body.position), video.duration)) : video.duration;
  const completed = body.completed === true;
  await prisma.videoProgress.upsert({ where: { userId_videoId: { userId: user.id, videoId: video.id } }, update: { lastPosition: position, completed }, create: { userId: user.id, videoId: video.id, lastPosition: position, completed } });
  return NextResponse.json({ completed });
}
