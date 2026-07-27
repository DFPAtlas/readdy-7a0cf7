"use client";

export function isDemoAccount(userOrProfile?: { email?: string; access_type?: string } | null): boolean {
  if (typeof window !== "undefined") {
    const demoMode = localStorage.getItem("lethub_demo_mode");
    if (demoMode === "true") return true;
  }

  if (userOrProfile) {
    if (userOrProfile.email === "demo@lethub.uk") return true;
    if ((userOrProfile as any).access_type === "demo") return true;
  }

  return false;
}

export function activateDemoSession() {
  if (typeof window !== "undefined") {
    localStorage.setItem("lethub_demo_mode", "true");
    localStorage.setItem("lethub_authenticated", "true");
    localStorage.setItem("lethub_role", "estate_agent_admin");
    localStorage.setItem("lethub_user", "demo@lethub.uk");
    localStorage.setItem("lethub_name", "Sarah Cooper");
    localStorage.setItem("lethub_account_type", "agency");
  }
}

export function deactivateDemoSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lethub_demo_mode");
    localStorage.removeItem("lethub_authenticated");
    localStorage.removeItem("lethub_role");
    localStorage.removeItem("lethub_user");
    localStorage.removeItem("lethub_name");
    localStorage.removeItem("lethub_account_type");
  }
}

export function showDemoBlockedMessage() {
  alert("This is a demo account. This action is disabled to protect live data.");
}