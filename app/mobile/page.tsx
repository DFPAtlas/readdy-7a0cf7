"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { afterMount } from "@/lib/safeNavigate";

export default function MobilePage() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("lethub_mobile_role");
    const target = stored ? `/mobile/${stored}` : "/mobile/role";
    const cancel = afterMount(() => router.push(target));
    return cancel;
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full"></div>
    </div>
  );
}