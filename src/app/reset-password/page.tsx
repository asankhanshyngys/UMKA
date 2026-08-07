"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useSearchParams(); const token = params.get("token") ?? "";
  const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setIsSubmitting(true); setMessage(""); try { const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }); const data = await response.json() as { message?: string; error?: string }; setMessage(data.message ?? data.error ?? "Unable to reset password."); } finally { setIsSubmitting(false); } }
  return <main className="flex min-h-screen items-center justify-center bg-background px-6"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm"><div><p className="text-sm text-foreground-subtle">UMKA</p><h1 className="mt-1 font-serif text-3xl text-foreground">Choose a new password</h1></div><label className="block text-sm text-foreground">New password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-foreground" autoComplete="new-password" /></label><button disabled={!token || isSubmitting} className="w-full rounded-lg bg-accent px-4 py-3 text-white disabled:opacity-60">{isSubmitting ? "Updating…" : "Update password"}</button>{!token && <p role="alert" className="text-sm text-red-600">This reset link is incomplete.</p>}{message && <p role="status" className="text-sm text-foreground-muted">{message}</p>}<p className="text-center text-sm text-foreground-muted"><Link href="/login" className="text-accent underline">Back to sign in</Link></p></form></main>;
}
