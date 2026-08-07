import { NextResponse } from "next/server";
import { hashToken } from "@/lib/account-tokens";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { token?: unknown } | null;
  if (typeof body?.token !== "string") return NextResponse.json({ error: "Invalid verification link." }, { status: 400 });
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(body.token) } });
  if (!record || record.expiresAt <= new Date()) return NextResponse.json({ error: "This verification link is invalid or has expired." }, { status: 400 });
  await prisma.$transaction([prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }), prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } })]);
  return NextResponse.json({ message: "Email verified. Thank you!" });
}
