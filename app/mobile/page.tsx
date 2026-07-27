"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MobilePage() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("lethub_mobile_role");
    if (stored) {
      router.push(`/mobile/${stored}`);
    } else {
      router.push("/mobile/role");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full"></div>
    </div>
  );
}