import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

interface TokenPayload {
  userId: string;
}

function getJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured.");
  }

  return JWT_SECRET;
}

export function createToken(userId: string) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return typeof decoded === "string" ? null : (decoded as TokenPayload);
  } catch {
    return null;
  }
}

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true, emailVerifiedAt: true },
  });
});

export async function getCurrentAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" ? user : null;
}
