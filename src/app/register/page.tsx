"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error ?? t("registerFailed"));
      else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError(t("serverError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute right-4 top-6 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <div>
          <p className="text-sm text-foreground-subtle">{tCommon("brand")}</p>
          <h1 className="mt-1 font-serif text-3xl text-foreground">{t("registerTitle")}</h1>
          <p className="mt-2 text-sm text-foreground-muted">{t("registerSubtitle")}</p>
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}
        <label className="block text-sm text-foreground">
          {tCommon("name")}
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-foreground"
            autoComplete="name"
          />
        </label>
        <label className="block text-sm text-foreground">
          {tCommon("email")}
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-foreground"
            autoComplete="email"
          />
        </label>
        <label className="block text-sm text-foreground">
          {tCommon("password")}
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-foreground"
            autoComplete="new-password"
          />
        </label>
        <button
          disabled={isSubmitting}
          className="w-full rounded-lg bg-accent px-4 py-3 text-white disabled:opacity-60"
        >
          {isSubmitting ? t("creatingAccount") : t("createAccount")}
        </button>
        <p className="text-center text-sm text-foreground-muted">
          {t("hasAccount")}{" "}
          <Link href="/login" className="text-accent underline">
            {t("loginLink")}
          </Link>
        </p>
      </form>
    </main>
  );
}
