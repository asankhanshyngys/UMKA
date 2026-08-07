import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { hashToken } from "@/lib/account-tokens";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { token?: unknown; password?: unknown } | null;
  if (typeof body?.token !== "string" || typeof body?.password !== "string" || body.password.length < 8) return NextResponse.json({ error: "Use a valid link and a password with at least 8 characters." }, { status: 400 });
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(body.token) } });
  if (!record || record.expiresAt <= new Date()) return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  const password = await bcrypt.hash(body.password, 10);
  await prisma.$transaction([prisma.user.update({ where: { id: record.userId }, data: { password } }), prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } })]);
  return NextResponse.json({ message: "Password updated. You can now sign in." });
}
