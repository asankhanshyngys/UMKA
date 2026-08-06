"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Не удалось войти.");
      } else {
        router.push(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
        router.refresh();
      }
    } catch {
      setError("Не удалось подключиться к серверу. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-5 rounded-2xl bg-card p-8 shadow-sm">
        <div><p className="text-sm text-foreground-subtle">УМКА</p><h1 className="mt-1 font-serif text-3xl text-foreground">Войти</h1></div>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="block text-sm text-foreground">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-white p-3" autoComplete="email" /></label>
        <label className="block text-sm text-foreground">Пароль<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-white p-3" autoComplete="current-password" /></label>
        <button disabled={isSubmitting} className="w-full rounded-lg bg-accent px-4 py-3 text-white disabled:opacity-60">{isSubmitting ? "Входим…" : "Войти"}</button>
        <p className="text-center text-sm text-foreground-muted">Нет аккаунта? <Link href="/register" className="text-accent underline">Зарегистрироваться</Link></p>
      </form>
    </main>
  );
}
