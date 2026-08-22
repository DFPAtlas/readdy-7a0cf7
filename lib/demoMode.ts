"use client";

import { DEMO_COOKIE } from "./supabase/cookies";

export function isDemoAccount(userOrProfile?: { email?: string; access_type?: string } | null): boolean {
  if (typeof window !== "undefined") {
    if (localStorage.getItem("lethub_demo_mode") === "true") return true;
  }

  if (userOrProfile) {
    if (userOrProfile.email === "demo@lethub.uk") return true;
    if (userOrProfile.access_type === "demo") return true;
  }

  return false;
}

function setDemoCookie(value: string) {
  if (typeof document === "undefined") return;
  if (value) {
    document.cookie = `${DEMO_COOKIE}=${value}; path=/; max-age=86400; samesite=lax`;
  } else {
    document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; samesite=lax`;
  }
}

export function activateDemoSession() {
  if (typeof window !== "undefined") {
    localStorage.setItem("lethub_demo_mode", "true");
    localStorage.setItem("lethub_user", "demo@lethub.uk");
    localStorage.setItem("lethub_name", "Sarah Cooper");
  }
  setDemoCookie("1");
}

export function deactivateDemoSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lethub_demo_mode");
    localStorage.removeItem("lethub_user");
    localStorage.removeItem("lethub_name");
  }
  setDemoCookie("");
}

export function showDemoBlockedMessage() {
  alert("This is a demo account. This action is disabled to protect live data.");
}