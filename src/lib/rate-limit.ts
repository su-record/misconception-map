const HOUR_MS = 60 * 60 * 1_000;
const PER_IP_LIMIT = 30;
const GLOBAL_LIMIT = 300;

type LimitConfig = { perKeyLimit: number; globalLimit: number; windowMs: number };
export type LimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function createSlidingWindowLimiter(config: LimitConfig) {
  const byKey = new Map<string, number[]>();
  let globalEvents: number[] = [];
  return {
    check(key: string, now = Date.now()): LimitResult {
      const cutoff = now - config.windowMs;
      globalEvents = globalEvents.filter((timestamp) => timestamp > cutoff);
      pruneKeys(byKey, cutoff);
      const keyEvents = byKey.get(key) ?? [];
      if (keyEvents.length >= config.perKeyLimit) return denied(keyEvents[0], now, config.windowMs);
      if (globalEvents.length >= config.globalLimit) return denied(globalEvents[0], now, config.windowMs);
      keyEvents.push(now); globalEvents.push(now); byKey.set(key, keyEvents);
      return { allowed: true };
    },
  };
}

function pruneKeys(byKey: Map<string, number[]>, cutoff: number) {
  byKey.forEach((events, key) => {
    const current = events.filter((timestamp) => timestamp > cutoff);
    if (current.length) byKey.set(key, current); else byKey.delete(key);
  });
}

function denied(oldest: number, now: number, windowMs: number): LimitResult {
  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1_000)) };
}

type SharedGlobal = typeof globalThis & { misconceptionMapLlmLimiter?: ReturnType<typeof createSlidingWindowLimiter> };
const sharedGlobal = globalThis as SharedGlobal;
export const llmRateLimiter = sharedGlobal.misconceptionMapLlmLimiter
  ?? createSlidingWindowLimiter({ perKeyLimit: PER_IP_LIMIT, globalLimit: GLOBAL_LIMIT, windowMs: HOUR_MS });
sharedGlobal.misconceptionMapLlmLimiter = llmRateLimiter;

export function clientIp(request: Request) {
  return request.headers.get("cf-connecting-ip")?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}
