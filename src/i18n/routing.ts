import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ru", "kz"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "ru",
  localePrefix: "never",
});
