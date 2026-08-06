"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await response.json();
      if (!response.ok) setError(data.error ?? "Не удалось создать аккаунт.");
      else { router.push("/dashboard"); router.refresh(); }
    } catch { setError("Не удалось подключиться к серверу. Попробуйте ещё раз."); }
    finally { setIsSubmitting(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-2xl bg-card p-8 shadow-sm">
        <div><p className="text-sm text-foreground-subtle">УМКА</p><h1 className="mt-1 font-serif text-3xl text-foreground">Создать аккаунт</h1><p className="mt-2 text-sm text-foreground-muted">Начните изучать английский в своём темпе.</p></div>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="block text-sm text-foreground">Имя<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-white p-3" autoComplete="name" /></label>
        <label className="block text-sm text-foreground">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-white p-3" autoComplete="email" /></label>
        <label className="block text-sm text-foreground">Пароль<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-white p-3" autoComplete="new-password" /></label>
        <button disabled={isSubmitting} className="w-full rounded-lg bg-accent px-4 py-3 text-white disabled:opacity-60">{isSubmitting ? "Создаём аккаунт…" : "Создать аккаунт"}</button>
        <p className="text-center text-sm text-foreground-muted">Уже есть аккаунт? <Link href="/login" className="text-accent underline">Войти</Link></p>
      </form>
    </main>
  );
}
