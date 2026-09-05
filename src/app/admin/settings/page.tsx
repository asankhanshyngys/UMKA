import { updatePlatformSettings } from "./actions";
import { getPlatformSettings } from "@/lib/platform-settings";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const settings = await getPlatformSettings();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="text-sm text-foreground-subtle">Platform settings</p>
        <h1 className="mt-1 font-serif text-4xl">Payments & homepage</h1>
        <p className="mt-3 text-foreground-muted">Configure checkout, subscription prices, and the media shown in the homepage Hero.</p>
      </div>

      {saved === "1" && (
        <p role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          Настройки сохранены.
        </p>
      )}

      <form action={updatePlatformSettings} className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium">WhatsApp number</span>
          <input name="whatsappNumber" type="tel" defaultValue={settings?.whatsappNumber ?? ""} placeholder="+7 700 000 00 00" className="w-full rounded-lg border border-border bg-background px-3 py-2" />
          <span className="block text-xs text-foreground-subtle">Include the country code. This number is never shown publicly; it is used only to create a wa.me checkout link.</span>
        </label>

        <div className="border-t border-border pt-5">
          <h2 className="font-serif text-2xl">Hero media</h2>
          <p className="mt-1 text-sm text-foreground-muted">A photo is the main Hero visual. An optional video URL makes the play button open that video in a new tab.</p>
          <div className="mt-4 grid gap-4">
            <div className="space-y-2"><span className="text-sm font-medium">Hero image</span><ImageUploadField name="heroImageUrl" defaultValue={settings?.heroImageUrl} label="Hero image" /></div>
            <label className="block space-y-2"><span className="text-sm font-medium">Hero video URL (optional)</span><input name="heroVideoUrl" type="url" defaultValue={settings?.heroVideoUrl ?? ""} placeholder="https://example.com/intro-video" className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-2"><span className="text-sm font-medium">1 month, ₸</span><input required name="oneMonthSubscription" type="number" min="0" step="1" defaultValue={settings?.oneMonthSubscription ?? 0} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="block space-y-2"><span className="text-sm font-medium">3 months, ₸</span><input required name="threeMonthSubscription" type="number" min="0" step="1" defaultValue={settings?.threeMonthSubscription ?? 0} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="block space-y-2"><span className="text-sm font-medium">6 months, ₸</span><input required name="sixMonthSubscription" type="number" min="0" step="1" defaultValue={settings?.sixMonthSubscription ?? 0} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
        </div>

        <AdminSubmitButton pendingLabel="Сохраняю настройки…" className="min-h-11 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">Сохранить настройки</AdminSubmitButton>
      </form>
    </div>
  );
}
