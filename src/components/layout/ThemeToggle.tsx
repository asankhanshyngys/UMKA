"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("theme");
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const isDark = resolvedTheme === "dark";

  // The server cannot know the saved or system theme. Keep the first browser
  // render identical to the server output, then show the resolved theme.
  const showLightModeAction = mounted && isDark;

  return (
    <button
      type="button"
      onClick={() => setTheme(showLightModeAction ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground-muted transition-colors hover:bg-card hover:text-foreground"
      aria-label={t("toggle")}
      title={showLightModeAction ? t("light") : t("dark")}
    >
      {showLightModeAction ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
