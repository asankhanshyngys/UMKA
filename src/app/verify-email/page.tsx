"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const token = useSearchParams().get("token") ?? "";
  const [message, setMessage] = useState(() => token ? "Verifying your email…" : "This verification link is incomplete.");
  useEffect(() => { if (!token) return; fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(async (response) => { const data = await response.json() as { message?: string; error?: string }; setMessage(data.message ?? data.error ?? "Unable to verify email."); }).catch(() => setMessage("Unable to verify email.")); }, [token]);
  return <main className="flex min-h-screen items-center justify-center bg-background px-4"><section className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm"><p className="text-sm text-foreground-subtle">UMKA</p><h1 className="font-serif text-3xl text-foreground">Email verification</h1><p role="status" className="text-foreground-muted">{message}</p><Link href="/login" className="inline-block text-sm text-accent underline">Go to sign in</Link></section></main>;
}
