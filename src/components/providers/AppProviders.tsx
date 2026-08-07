"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/routing";

type AppProvidersProps = {
  children: ReactNode;
  locale: Locale;
  messages: Record<string, unknown>;
};

export function AppProviders({ children, locale, messages }: AppProvidersProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <NextIntlClientProvider locale={locale} timeZone="Asia/Qyzylorda" messages={messages}>
        {children}
      </NextIntlClientProvider>
    </NextThemesProvider>
  );
}
