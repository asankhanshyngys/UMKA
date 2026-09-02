import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/account-tokens";
import { sendPasswordResetEmail } from "@/lib/auth-email";
import { prisma } from "@/lib/prisma";
import { checkEndpointRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = checkEndpointRateLimit("forgot-password", getClientIp(request), 5, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ message: "If an account exists for this email, a reset link has been sent." });
  const body = await request.json().catch(() => null) as { email?: unknown } | null;
  if (typeof body?.email !== "string") return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: body.email.trim().toLowerCase() }, select: { id: true, email: true } });
  if (user) {
    try {
      const token = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(user.email, token);
    } catch (error) {
      console.error("Unable to send password reset email", error);
      return NextResponse.json({ error: "We could not send an email right now. Check the email sender settings and try again." }, { status: 503 });
    }
  }
  return NextResponse.json({ message: "If an account exists for this email, a reset link has been sent." });
}
