"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setIsSubmitting(true); setMessage("");
    try { const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const data = await response.json().catch(() => ({})) as { message?: string; error?: string }; setMessage(data.message ?? data.error ?? "Unable to request a reset link."); } catch { setMessage("Unable to request a reset link."); } finally { setIsSubmitting(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-background px-6"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm"><div><p className="text-sm text-foreground-subtle">UMKA</p><h1 className="mt-1 font-serif text-3xl text-foreground">Reset your password</h1><p className="mt-2 text-sm text-foreground-muted">Enter your email and we&apos;ll send a secure reset link.</p></div><label className="block text-sm text-foreground">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-foreground" autoComplete="email" /></label><button disabled={isSubmitting} className="w-full rounded-lg bg-accent px-4 py-3 text-white disabled:opacity-60">{isSubmitting ? "Sending…" : "Send reset link"}</button>{message && <p role="status" className="text-sm text-foreground-muted">{message}</p>}<p className="text-center text-sm text-foreground-muted"><Link href="/login" className="text-accent underline">Back to sign in</Link></p></form></main>;
}
