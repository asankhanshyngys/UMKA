"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlatformSettings } from "@/lib/platform-settings";
import { CACHE_TAGS } from "@/lib/cache-tags";

function parsePrice(value: FormDataEntryValue | null, field: string) {
  const price = Number(value);
  if (!Number.isInteger(price) || price < 0) throw new Error(`${field} must be a non-negative whole number.`);
  return price;
}

export async function updatePlatformSettings(formData: FormData) {
  if (!await getCurrentAdmin()) throw new Error("Unauthorized");

  const data = {
    whatsappNumber: String(formData.get("whatsappNumber") ?? "").trim() || null,
    heroImageUrl: String(formData.get("heroImageUrl") ?? "").trim() || null,
    heroVideoUrl: String(formData.get("heroVideoUrl") ?? "").trim() || null,
    oneMonthSubscription: parsePrice(formData.get("oneMonthSubscription"), "One-month subscription price"),
    threeMonthSubscription: parsePrice(formData.get("threeMonthSubscription"), "Three-month subscription price"),
    sixMonthSubscription: parsePrice(formData.get("sixMonthSubscription"), "Six-month subscription price"),
  };

  const settings = await getPlatformSettings();
  if (settings) await prisma.platformSettings.update({ where: { id: settings.id }, data });
  else await prisma.platformSettings.create({ data });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidateTag(CACHE_TAGS.settings, { expire: 0 });
  redirect("/admin/settings?saved=1");
}
