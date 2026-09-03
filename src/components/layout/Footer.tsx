import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { getPlatformSettings } from "@/lib/platform-settings";

const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export async function Footer() {
  const t = await getTranslations("footer");
  let whatsappNumber: string | null = null;

  try {
    whatsappNumber = (await getPlatformSettings())?.whatsappNumber ?? null;
  } catch (error) {
    console.error("Could not load public contact settings", error);
  }

  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : null;

  return (
    <footer className="border-t border-border bg-card">
      <div className="px-4 py-12 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-serif text-lg font-medium text-white">U</span>
              <span className="text-sm font-medium text-foreground">UMKA</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground-muted">{t("description")}</p>
            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background hover:text-foreground"><InstagramIcon className="h-5 w-5" /></a>}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("navigation")}</h2>
            <nav className="mt-4 flex flex-col items-start gap-3 text-sm text-foreground-muted">
              <Link href="/about" className="hover:text-foreground">{t("about")}</Link>
              <Link href="/#catalog" className="hover:text-foreground">{t("courses")}</Link>
              <Link href="/#books" className="hover:text-foreground">{t("books")}</Link>
              <Link href="/#subscriptions" className="hover:text-foreground">{t("subscriptions")}</Link>
            </nav>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("contacts")}</h2>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-foreground-muted">
              <Link href="/contacts" className="hover:text-foreground">{t("contactsPage")}</Link>
              {contactEmail ? <a href={`mailto:${contactEmail}`} className="hover:text-foreground">{contactEmail}</a> : <span>{t("emailPending")}</span>}
              {whatsappHref ? <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">WhatsApp: {whatsappNumber}</a> : <span>{t("whatsappPending")}</span>}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("legal")}</h2>
            <nav className="mt-4 flex flex-col items-start gap-3 text-sm text-foreground-muted">
              <a href="#" className="hover:text-foreground">{t("privacy")}</a>
              <a href="#" className="hover:text-foreground">{t("offer")}</a>
            </nav>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-sm text-foreground-subtle">© {new Date().getFullYear()} UMKA English. {t("rights")}</div>
      </div>
    </footer>
  );
}
