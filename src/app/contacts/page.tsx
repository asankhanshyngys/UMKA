import { getTranslations } from "next-intl/server";
import { getPlatformSettings } from "@/lib/platform-settings";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default async function ContactsPage() {
  const t = await getTranslations("footer");
  let whatsappNumber: string | null = null;

  try {
    whatsappNumber = (await getPlatformSettings())?.whatsappNumber ?? null;
  } catch (error) {
    console.error("Could not load public contact settings", error);
  }

  return <main className="main-with-mobile-nav px-4 py-14 sm:px-6 lg:px-12 xl:px-20"><section className="mx-auto max-w-3xl"><p className="text-sm text-foreground-subtle">UMKA English</p><h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">{t("contacts")}</h1><div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 text-foreground-muted"><p>{t("contactsPlaceholder")}</p><p><span className="font-medium text-foreground">Email: </span>{contactEmail ?? t("emailPending")}</p><p><span className="font-medium text-foreground">WhatsApp: </span>{whatsappNumber ?? t("whatsappPending")}</p><p><span className="font-medium text-foreground">{t("address")}: </span>{t("addressPending")}</p></div></section></main>;
}
