"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parsePrice(value: FormDataEntryValue | null, field: string) {
  const price = Number(value);
  if (!Number.isInteger(price) || price < 0) throw new Error(`${field} must be a non-negative whole number.`);
  return price;
}

export async function updatePlatformSettings(formData: FormData) {
  if (!await getCurrentAdmin()) throw new Error("Unauthorized");

  const data = {
    whatsappNumber: String(formData.get("whatsappNumber") ?? "").trim() || null,
    oneMonthSubscription: parsePrice(formData.get("oneMonthSubscription"), "One-month subscription price"),
    threeMonthSubscription: parsePrice(formData.get("threeMonthSubscription"), "Three-month subscription price"),
    sixMonthSubscription: parsePrice(formData.get("sixMonthSubscription"), "Six-month subscription price"),
  };

  const settings = await prisma.platformSettings.findFirst();
  if (settings) await prisma.platformSettings.update({ where: { id: settings.id }, data });
  else await prisma.platformSettings.create({ data });

  revalidatePath("/admin/settings");
}
