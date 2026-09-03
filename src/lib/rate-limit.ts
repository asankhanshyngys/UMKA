import { Redis } from "@upstash/redis";
type RateLimitEntry = { attempts: number; resetAt: number };
type RateLimitStore = Map<string, RateLimitEntry>;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const globalForRateLimit = globalThis as typeof globalThis & { loginRateLimitStore?: RateLimitStore; endpointRateLimitStores?: Map<string, RateLimitStore>; rateLimitRedisWarningShown?: boolean };
const loginRateLimitStore = globalForRateLimit.loginRateLimitStore ?? new Map<string, RateLimitEntry>();
const endpointStores = globalForRateLimit.endpointRateLimitStores ?? new Map<string, RateLimitStore>();
if (process.env.NODE_ENV !== "production") { globalForRateLimit.loginRateLimitStore = loginRateLimitStore; globalForRateLimit.endpointRateLimitStores = endpointStores; }
if (!redis && !globalForRateLimit.rateLimitRedisWarningShown) { console.warn("Upstash Redis is not configured; rate limiting uses in-memory storage only."); globalForRateLimit.rateLimitRedisWarningShown = true; }
function prune(store: RateLimitStore, now: number) { for (const [key, entry] of store) if (entry.resetAt <= now) store.delete(key); }
export function getClientIp(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"; }
export async function checkLoginRateLimit(key: string) {
  const redisKey = `auth:login:${key}`;
  if (redis) { const [attempts, ttl] = await Promise.all([redis.get<number>(redisKey), redis.ttl(redisKey)]); if (!attempts || attempts < MAX_ATTEMPTS) return { allowed: true as const }; return { allowed: false as const, retryAfterSeconds: Math.max(1, ttl) }; }
  const now = Date.now(); prune(loginRateLimitStore, now); const entry = loginRateLimitStore.get(redisKey); if (!entry || entry.attempts < MAX_ATTEMPTS) return { allowed: true as const }; return { allowed: false as const, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
}
export async function recordFailedLogin(key: string) { const redisKey = `auth:login:${key}`; if (redis) { const attempts = await redis.incr(redisKey); if (attempts === 1) await redis.expire(redisKey, WINDOW_MS / 1000); return; } const now = Date.now(); const entry = loginRateLimitStore.get(redisKey); loginRateLimitStore.set(redisKey, !entry || entry.resetAt <= now ? { attempts: 1, resetAt: now + WINDOW_MS } : { ...entry, attempts: entry.attempts + 1 }); }
export async function clearLoginRateLimit(key: string) { const redisKey = `auth:login:${key}`; loginRateLimitStore.delete(redisKey); if (redis) await redis.del(redisKey); }
export async function checkEndpointRateLimit(endpoint: string, key: string, maxAttempts: number, windowMs: number) {
  const redisKey = `auth:${endpoint}:${key}`;
  if (redis) { const attempts = await redis.incr(redisKey); if (attempts === 1) await redis.expire(redisKey, Math.ceil(windowMs / 1000)); if (attempts <= maxAttempts) return { allowed: true as const }; return { allowed: false as const, retryAfterSeconds: Math.max(1, await redis.ttl(redisKey)) }; }
  const store = endpointStores.get(endpoint) ?? new Map<string, RateLimitEntry>(); endpointStores.set(endpoint, store); const now = Date.now(); prune(store, now); const entry = store.get(redisKey); if (!entry || entry.resetAt <= now) { store.set(redisKey, { attempts: 1, resetAt: now + windowMs }); return { allowed: true as const }; } if (entry.attempts >= maxAttempts) return { allowed: false as const, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) }; entry.attempts += 1; return { allowed: true as const };
}
