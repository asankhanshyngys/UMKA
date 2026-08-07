import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function expiresIn(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export async function createEmailVerificationToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId } }),
    prisma.emailVerificationToken.create({ data: { userId, tokenHash: hashToken(token), expiresAt: expiresIn(24) } }),
  ]);
  return token;
}

export async function createPasswordResetToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({ data: { userId, tokenHash: hashToken(token), expiresAt: expiresIn(1) } }),
  ]);
  return token;
}

export { hashToken };
