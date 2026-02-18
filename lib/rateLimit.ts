type RateLimitOptions = {
  windowMs: number; // time window
  max: number; // max requests in window
  keyPrefix?: string;
};

type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // epoch ms
};

const store = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request) {
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();

  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();

  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  return "unknown";
}

export async function rateLimit(
  req: Request,
  opts: Partial<RateLimitOptions> = {}
): Promise<RateLimitResult> {
  const windowMs = opts.windowMs ?? 60_000; // default 60s
  const max = opts.max ?? 20; // default 20 per minute
  const keyPrefix = opts.keyPrefix ?? "rl:";

  const ip = getClientIp(req);
  const key = `${keyPrefix}${ip}`;

  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, limit: max, remaining: max - 1, resetAt };
  }

  existing.count += 1;

  const remaining = Math.max(0, max - existing.count);
  const ok = existing.count <= max;

  store.set(key, existing);

  return {
    ok,
    limit: max,
    remaining,
    resetAt: existing.resetAt,
  };
}