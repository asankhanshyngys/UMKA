import { Apple, Globe2, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

const providers = [
  ["google", "Google", Globe2],
  ["apple", "Apple", Apple],
  ["facebook", "Facebook", UsersRound],
] as const;

export function OAuthButtons() {
  const t = useTranslations("auth");
  return <div className="space-y-3"><div className="flex items-center gap-3 text-xs text-foreground-subtle before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">{t("orContinueWith")}</div><div className="grid gap-2 sm:grid-cols-3">{providers.map(([id, label, Icon]) => <a key={id} href={`/api/auth/oauth/${id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-background"><Icon className="h-4 w-4" />{label}</a>)}</div></div>;
}
