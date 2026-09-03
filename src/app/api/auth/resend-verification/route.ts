import { NextResponse } from "next/server";
import { createEmailVerificationToken } from "@/lib/account-tokens";
import { sendVerificationEmail } from "@/lib/auth-email";
import { getCurrentUser } from "@/lib/auth";
import { checkEndpointRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = await checkEndpointRateLimit("resend-verification", getClientIp(request), 3, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ message: "If verification is needed, a fresh link will be sent shortly." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (user.emailVerifiedAt) return NextResponse.json({ message: "Your email is already verified." });
  try {
    const token = await createEmailVerificationToken(user.id);
    await sendVerificationEmail(user.email, token);
    return NextResponse.json({ message: "A fresh verification link has been sent." });
  } catch (error) {
    console.error("Unable to resend verification email", error);
    return NextResponse.json({ error: "We could not send an email right now. Check the email sender settings and try again." }, { status: 503 });
  }
}
