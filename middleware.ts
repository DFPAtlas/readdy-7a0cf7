import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight IP-based rate limiter for the unauthenticated entry points that
// matter most: login and registration. This is a stopgap, not a production
// production-grade solution -- see the note at the bottom of this file.
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

type Bucket = { count: number; windowStart: number };

// NOTE: this Map is per-instance memory. On Vercel's serverless/edge
// deployment model, concurrent requests can land on different instances that
// each keep their own counters, so this will under-count during traffic
// spikes or multi-instance deploys. It still meaningfully raises the bar
// against a single scripted client hammering login/register from one
// connection, but it is NOT a substitute for a shared store.
//
// For durable, correctly-shared rate limiting across all instances, move
// this to Upstash Redis (@upstash/ratelimit) or enable Vercel's Firewall
// rate limiting rules at the edge -- both apply before this middleware runs
// and don't depend on in-memory state. Supabase Auth also applies its own
// server-side rate limits to signInWithPassword/signUp independently of
// this file, so this middleware is a second, complementary layer rather
// than the only line of defence.
const buckets = new Map<string, Bucket>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return false;
  }

  existing.count += 1;
  return existing.count > MAX_REQUESTS_PER_WINDOW;
}

export function middleware(request: NextRequest) {
  const ip = getClientIp(request);
  const key = `${ip}:${request.nextUrl.pathname}`;

  if (isRateLimited(key)) {
    return new NextResponse("Too many requests. Please wait a moment and try again.", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/owner/login", "/tenant/login"],
};
