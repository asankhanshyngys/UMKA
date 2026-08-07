import { NextResponse } from "next/server";
import { createEmailVerificationToken } from "@/lib/account-tokens";
import { sendVerificationEmail } from "@/lib/auth-email";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
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
