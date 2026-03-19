import { prisma } from "@/lib/prisma";

function getClientIp(req: Request | null | undefined): string {
  if (!req) return "unknown";

  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();

  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();

  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  return "unknown";
}

function getUserAgent(req: Request | null | undefined): string | null {
  if (!req) return null;
  const ua = req.headers.get("user-agent");
  return ua || null;
}

export function logError(
  req: Request | null | undefined,
  options: {
    severity: "critical" | "high" | "medium" | "low";
    type: string;
    message: string;
    stack?: string;
    path?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  const ip = getClientIp(req);
  const userAgent = getUserAgent(req);

  (prisma as any).errorLog
    .create({
      data: {
        severity: options.severity,
        type: options.type,
        message: options.message,
        stack: options.stack || null,
        path: options.path || null,
        ip,
        userAgent,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
      },
    })
    .catch((err: unknown) => console.error("Failed to log error to database:", err));
}
