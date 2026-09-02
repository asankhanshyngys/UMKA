import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16 sm:px-6">
      <Card className="w-full max-w-xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="text-3xl font-semibold text-foreground">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-md text-foreground-subtle">{t("description")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/"><Button>{t("home")}</Button></Link>
          <Link href="/courses"><Button variant="secondary">{t("courses")}</Button></Link>
        </div>
      </Card>
    </main>
  );
}
