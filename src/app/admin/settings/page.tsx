import { updatePlatformSettings } from "./actions";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const settings = await prisma.platformSettings.findFirst();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="text-sm text-foreground-subtle">Platform settings</p>
        <h1 className="mt-1 font-serif text-4xl">Payments</h1>
        <p className="mt-3 text-foreground-muted">Configure the WhatsApp number that receives purchase requests and the subscription prices shown in checkout.</p>
      </div>

      <form action={updatePlatformSettings} className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium">WhatsApp number</span>
          <input name="whatsappNumber" type="tel" defaultValue={settings?.whatsappNumber ?? ""} placeholder="+7 700 000 00 00" className="w-full rounded-lg border border-border bg-background px-3 py-2" />
          <span className="block text-xs text-foreground-subtle">Include the country code. This number is never shown publicly; it is used only to create a wa.me checkout link.</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-2"><span className="text-sm font-medium">1 month, ₸</span><input required name="oneMonthSubscription" type="number" min="0" step="1" defaultValue={settings?.oneMonthSubscription ?? 0} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="block space-y-2"><span className="text-sm font-medium">3 months, ₸</span><input required name="threeMonthSubscription" type="number" min="0" step="1" defaultValue={settings?.threeMonthSubscription ?? 0} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="block space-y-2"><span className="text-sm font-medium">6 months, ₸</span><input required name="sixMonthSubscription" type="number" min="0" step="1" defaultValue={settings?.sixMonthSubscription ?? 0} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
        </div>

        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">Save settings</button>
      </form>
    </div>
  );
}
