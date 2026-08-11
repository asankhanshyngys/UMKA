type RateLimitEntry = {
  attempts: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const globalForRateLimit = globalThis as typeof globalThis & {
  loginRateLimitStore?: RateLimitStore;
};

const loginRateLimitStore = globalForRateLimit.loginRateLimitStore ?? new Map<string, RateLimitEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.loginRateLimitStore = loginRateLimitStore;
}

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of loginRateLimitStore) {
    if (entry.resetAt <= now) loginRateLimitStore.delete(key);
  }
}

export function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

export function checkLoginRateLimit(key: string) {
  const now = Date.now();
  pruneExpiredEntries(now);
  const entry = loginRateLimitStore.get(key);

  if (!entry || entry.attempts < MAX_ATTEMPTS) return { allowed: true as const };

  return {
    allowed: false as const,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

export function recordFailedLogin(key: string) {
  const now = Date.now();
  const entry = loginRateLimitStore.get(key);
  const nextEntry = !entry || entry.resetAt <= now
    ? { attempts: 1, resetAt: now + WINDOW_MS }
    : { ...entry, attempts: entry.attempts + 1 };

  loginRateLimitStore.set(key, nextEntry);
}

export function clearLoginRateLimit(key: string) {
  loginRateLimitStore.delete(key);
}
