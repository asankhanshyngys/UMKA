"use client";

import { useState } from "react";

export function EmailVerificationNotice({ email }: { email: string }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  async function resend() {
    setSending(true); setMessage("");
    try { const response = await fetch("/api/auth/resend-verification", { method: "POST" }); const data = await response.json().catch(() => ({})) as { message?: string; error?: string }; setMessage(data.message ?? data.error ?? "Unable to send a verification email."); } catch { setMessage("Unable to send a verification email."); } finally { setSending(false); }
  }
  return <section className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><p className="font-medium">Verify your email address</p><p className="mt-1">Check <span className="font-medium">{email}</span> for your verification link. You can keep learning while you wait.</p><button type="button" disabled={sending} onClick={resend} className="mt-3 rounded border border-amber-400 px-3 py-2 text-sm font-medium disabled:opacity-60">{sending ? "Sending…" : "Resend verification email"}</button>{message && <p role="status" className="mt-2">{message}</p>}</section>;
}
