import { NextRequest, NextResponse } from "next/server";
import { routing, type Locale } from "@/i18n/routing";

export async function POST(request: NextRequest) {
  const { locale } = (await request.json()) as { locale?: string };

  if (!locale || !routing.locales.includes(locale as Locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
