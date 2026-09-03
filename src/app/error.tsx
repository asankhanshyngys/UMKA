"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errorBoundary");

  useEffect(() => {
    console.error("UMKA application error", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16 sm:px-6">
      <Card className="w-full max-w-xl text-center">
        <h1 className="text-3xl font-semibold text-foreground">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-md text-foreground-subtle">{t("description")}</p>
        {error.digest ? <p className="mt-4 text-xs text-foreground-subtle">{t("supportCode", { code: error.digest })}</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>{t("retry")}</Button>
          <Link href="/"><Button variant="secondary">{t("home")}</Button></Link>
        </div>
      </Card>
    </main>
  );
}
