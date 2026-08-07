import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { routing, type Locale } from "./routing";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = routing.locales.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : routing.defaultLocale;

  return {
    locale,
    timeZone: "Asia/Qyzylorda",
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
