const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
const customerCode = process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE;

export function isCloudflareStreamVideo(storageKey: string) {
  return storageKey.startsWith("cfstream:") && storageKey.length > "cfstream:".length;
}

export function streamVideoId(storageKey: string) {
  return storageKey.slice("cfstream:".length);
}

export async function createStreamPlaybackUrl(storageKey: string) {
  if (!accountId || !apiToken || !customerCode) throw new Error("Cloudflare Stream is not configured.");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${streamVideoId(storageKey)}/token`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 5 * 60 }),
      cache: "no-store",
    },
  );
  const payload = (await response.json()) as { success?: boolean; result?: { token?: string } };
  if (!response.ok || !payload.success || !payload.result?.token) throw new Error("Cloudflare Stream could not create a playback token.");

  return `https://customer-${customerCode}.cloudflarestream.com/${payload.result.token}/iframe`;
}
