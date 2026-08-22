"use client";

import { useRouter } from "next/navigation";
import { deactivateDemoSession } from "@/lib/demoMode";

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleSignOut = async () => {
    deactivateDemoSession();
    const { supabase } = await import("@/lib/supabaseClient");
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <button
      onClick={handleSignOut}
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-lg bg-[#C28A78] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B07A69] whitespace-nowrap"
      }
    >
      Sign out
    </button>
  );
}