function appUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

async function sendEmail(to: string, subject: string, html: string, link: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") console.info(`[UMKA email preview] ${subject} for ${to}: ${link}`);
    else console.error("Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM.");
    return;
  }
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [to], subject, html }) });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Email provider rejected the message: ${details.slice(0, 500)}`);
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${appUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  await sendEmail(email, "Verify your UMKA email", `<p>Welcome to UMKA.</p><p><a href="${link}">Verify your email address</a></p><p>This link expires in 24 hours.</p>`, link);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  await sendEmail(email, "Reset your UMKA password", `<p>Use the link below to set a new password.</p><p><a href="${link}">Reset password</a></p><p>This link expires in 1 hour.</p>`, link);
}
