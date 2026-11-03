"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";

export interface ActiveDevice {
  deviceLabel: string;
  browser: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet";
  icon: string;
  timeZone: string;
  language: string;
  signedInAt: string | null;
  expiresAt: string | null;
  method: string;
  standalone: boolean;
  demo: boolean;
}

function detectBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/SamsungBrowser/.test(ua)) return "Samsung Internet";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/CriOS/.test(ua)) return "Chrome";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Browser";
}

function detectOs(ua: string): string {
  if (/iPad/.test(ua)) return "iPadOS";
  if (/iPhone|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown device";
}

function detectType(ua: string): ActiveDevice["deviceType"] {
  if (/iPad|Tablet/.test(ua)) return "tablet";
  if (/iPhone|iPod|Android/.test(ua)) return "mobile";
  return "desktop";
}

function deviceIcon(type: ActiveDevice["deviceType"]): string {
  if (type === "mobile") return "ri-smartphone-line";
  if (type === "tablet") return "ri-tablet-line";
  return "ri-computer-line";
}

function methodLabel(provider: string | undefined): string {
  if (!provider) return "Email & password";
  if (provider === "email") return "Email & password";
  if (provider === "google") return "Google sign-in";
  if (provider === "apple") return "Apple sign-in";
  if (provider === "github") return "GitHub sign-in";
  return `${provider.charAt(0).toUpperCase()}${provider.slice(1)} sign-in`;
}

export function currentDeviceLabel(): string {
  if (typeof navigator === "undefined") return "Unknown device";
  const ua = navigator.userAgent;
  return `${detectBrowser(ua)} on ${detectOs(ua)}`;
}

export function formatTimeZone(timeZone: string): string {
  if (!timeZone) return "Unknown time zone";
  const parts = timeZone.split("/");
  const city = (parts[parts.length - 1] || timeZone).replace(/_/g, " ");
  return parts.length > 1 && parts[0] !== "Etc" ? city : city;
}

export function formatSessionDate(value: string | null): string {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useActiveDevice() {
  const [device, setDevice] = useState<ActiveDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const type = detectType(ua);
    const base: ActiveDevice = {
      deviceLabel: `${detectBrowser(ua)} on ${detectOs(ua)}`,
      browser: detectBrowser(ua),
      os: detectOs(ua),
      deviceType: type,
      icon: deviceIcon(type),
      timeZone: "",
      language: "",
      signedInAt: null,
      expiresAt: null,
      method: "Email & password",
      standalone: false,
      demo: false,
    };

    if (typeof window !== "undefined") {
      base.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      base.language = navigator.language || "";
      base.standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    }

    if (isDemoAccount()) {
      setDevice({
        ...base,
        signedInAt: new Date().toISOString(),
        method: "Demo workspace",
        demo: true,
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session) {
        setError("We couldn't read this session. Sign in again to see your device details.");
        setLoading(false);
        return;
      }

      const session = data.session;

      setDevice({
        ...base,
        signedInAt: session.user.last_sign_in_at || null,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        method: methodLabel(session.user.app_metadata?.provider),
      });
    } catch {
      setError("Something went wrong while reading your session.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { device, loading, error, reload: load };
}