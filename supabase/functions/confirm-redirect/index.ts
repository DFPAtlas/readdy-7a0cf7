import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Landing page for Supabase Auth email-confirmation links. Redirects only to
// an allowlisted LetHub origin. Source copied from the deployed function
// (version 10) so the repository matches production.

const ALLOWED_ORIGINS = new Set([
  "https://lethub.uk",
  "https://www.lethub.uk",
  "http://localhost:3000"
]);

function safeReturnTarget(raw: string | null): string {
  if (!raw) return "https://lethub.uk/login?email_confirmed=1";
  try {
    const parsed = new URL(raw, "https://lethub.uk");
    if (!ALLOWED_ORIGINS.has(parsed.origin)) {
      return "https://lethub.uk/login?email_confirmed=1";
    }
    if (!parsed.pathname.startsWith("/")) {
      return "https://lethub.uk/login?email_confirmed=1";
    }
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "https://lethub.uk/login?email_confirmed=1";
  }
}

Deno.serve((req: Request) => {
  const url = new URL(req.url);
  const target = safeReturnTarget(url.searchParams.get("return"));
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${target.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"><title>Email confirmed</title></head><body><p>Email confirmed. Redirecting securely…</p><script>window.location.replace(${JSON.stringify(target)});</script></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer"
    }
  });
});
