import { unstable_cache } from "next/cache";
import { assertDatabaseConfigured, prisma } from "@/lib/prisma";

export const getPlatformSettings = unstable_cache(
  async () => {
    assertDatabaseConfigured();
    return prisma.platformSettings.findFirst();
  },
  ["platform-settings"],
  { tags: ["settings"], revalidate: 300 },
);
