import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createStreamPlaybackUrl, isCloudflareStreamVideo } from "@/lib/cloudflare-stream";
import { hasLessonAccess } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { id } = await params;
  const video = await prisma.video.findFirst({
    where: { id, deletedAt: null, module: { deletedAt: null, course: { status: "PUBLISHED", deletedAt: null } } },
    select: { storageKey: true, isFreePreview: true, moduleId: true, module: { select: { courseId: true } } },
  });
  if (!video) return NextResponse.json({ error: "Video not found." }, { status: 404 });
  if (!isCloudflareStreamVideo(video.storageKey)) return NextResponse.json({ error: "This video is not hosted in Cloudflare Stream." }, { status: 409 });

  if (!video.isFreePreview && user.role !== "ADMIN") {
    const now = new Date();
    const [subscription, purchase, modulePurchase, videoPurchase] = await Promise.all([
      prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: now } } }),
      prisma.coursePurchase.findFirst({ where: { userId: user.id, courseId: video.module.courseId, status: "COMPLETED", expiresAt: { gt: now } } }),
      prisma.modulePurchase.findFirst({ where: { userId: user.id, moduleId: video.moduleId, status: "COMPLETED", expiresAt: { gt: now } } }),
      prisma.videoPurchase.findFirst({ where: { userId: user.id, videoId: id, status: "COMPLETED", expiresAt: { gt: now } } }),
    ]);
    if (!hasLessonAccess({ isAdmin: false, hasSubscription: Boolean(subscription), hasCoursePurchase: Boolean(purchase), hasModulePurchase: Boolean(modulePurchase), hasVideoPurchase: Boolean(videoPurchase) })) return NextResponse.json({ error: "Course, module, or lesson access required." }, { status: 403 });

    const courseVideos = await prisma.video.findMany({
      where: { deletedAt: null, module: { deletedAt: null, ...(modulePurchase ? { id: video.moduleId } : { courseId: video.module.courseId }) } },
      select: { id: true, practices: { select: { id: true } } },
      orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    });
    const position = courseVideos.findIndex((courseVideo) => courseVideo.id === id);
    const requiredPracticeIds = position > 0 ? courseVideos[position - 1].practices.map((practice) => practice.id) : [];
    if (requiredPracticeIds.length > 0 && !videoPurchase) {
      const completed = await prisma.practiceResult.count({ where: { userId: user.id, completed: true, practiceId: { in: requiredPracticeIds } } });
      if (completed !== requiredPracticeIds.length) return NextResponse.json({ error: "Complete the previous lesson's practice first." }, { status: 403 });
    }
  }

  try {
    return NextResponse.json({ playbackUrl: await createStreamPlaybackUrl(video.storageKey) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Cloudflare Stream playback token error", error);
    return NextResponse.json({ error: "Unable to prepare secure playback." }, { status: 503 });
  }
}
