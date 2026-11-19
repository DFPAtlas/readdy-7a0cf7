"use client";

import { useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import YourDataSection from "@/components/settings/YourDataSection";

export default function AccountDataPage() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[#FBF9F4] px-4 py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <Link href="/login" className="text-sm text-[#687068] hover:text-[#C28A78]">
              &larr; Back to LetHub
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-[#3A3F3A]">Your data</h1>
            <p className="text-sm text-[#687068] mt-1">Download a copy of your data or close your account.</p>
          </div>
          <YourDataSection onToast={showToast} />
        </div>
        {toast && (
          <div role="status" className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg">
            {toast}
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
