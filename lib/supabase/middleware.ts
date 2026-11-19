import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from "./cookies";
import { canAccessDashboardPath, getRoleHome, normaliseRole, pathMatchesPrefix } from "@/lib/rbac";

// Server-side session check for signed-in areas. Verifies the session with
// Supabase Auth (refreshing it when the access token has expired) before any
// protected page is served. Data access is still enforced by RLS; this stops
// protected pages being served to signed-out visitors and keeps roles in
// their own area.

type Area = { prefix: string; login: string; publicPaths?: string[] };

const AREAS: Area[] = [
  { prefix: "/dashboard", login: "/login" },
  { prefix: "/account/data", login: "/login" },
  { prefix: "/owner", login: "/owner/login", publicPaths: ["/owner/login"] },
  { prefix: "/tenant", login: "/tenant/login", publicPaths: ["/tenant/login"] },
  { prefix: "/contractor/dashboard", login: "/contractor/login" },
];

function isAuthOutage(error: { name?: string; status?: number }): boolean {
  if (error.name === "AuthRetryableFetchError") return true;
  const status = error.status ?? 0;
  return status === 0 || status >= 500;
}

export function protectedAreaFor(pathname: string): Area | null {
  for (const area of AREAS) {
    if (!pathMatchesPrefix(pathname, area.prefix)) continue;
    if (area.publicPaths?.some((p) => pathMatchesPrefix(pathname, p))) return null;
    return area;
  }
  return null;
}

export async function enforceSession(request: NextRequest, area: Area, isDemo: boolean): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response; // misconfigured build: fall back to client-side guards

  const supabase = createServerClient(url, key, {
    cookieOptions: {
      name: AUTH_COOKIE_NAME,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      maxAge: AUTH_COOKIE_MAX_AGE,
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  let userId: string | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      userId = data.user.id;
    } else if (error && isAuthOutage(error)) {
      // Supabase Auth unreachable or erroring: don't lock everyone out.
      console.error("middleware session check unavailable", error.name, error.status);
      return response;
    }
  } catch (err) {
    // Supabase unreachable: don't lock everyone out; client guards and RLS still apply.
    console.error("middleware session check failed", err);
    return response;
  }

  const withCookies = (target: NextResponse) => {
    response.cookies.getAll().forEach((c) => target.cookies.set(c));
    return target;
  };

  if (!userId) {
    // Demo visitors only ever see sample data.
    if (isDemo && pathMatchesPrefix(request.nextUrl.pathname, "/dashboard")) return response;
    const login = request.nextUrl.clone();
    login.pathname = area.login;
    login.search = "";
    login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return withCookies(NextResponse.redirect(login));
  }

  if (area.prefix === "/dashboard") {
    const pathname = request.nextUrl.pathname;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
    const role = normaliseRole((profile as { role?: string } | null)?.role ?? null);
    const portalRole = role === "landlord" || role === "tenant" || role === "contractor";
    const blocked = role ? !canAccessDashboardPath(role, pathname) || (pathname === "/dashboard" && portalRole) : false;
    if (role && blocked) {
      const home = request.nextUrl.clone();
      home.pathname = role === "suspended" ? "/account/suspended" : getRoleHome(role);
      home.search = "";
      return withCookies(NextResponse.redirect(home));
    }
  }

  return response;
}
