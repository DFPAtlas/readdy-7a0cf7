'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { afterMount } from '@/lib/safeNavigate';

export default function LegacyPropertyRedirect({ productId }: { productId: string }) {
  const router = useRouter();

  useEffect(() => {
    const cancel = afterMount(() => {
      router.replace(`/dashboard/portfolio/${encodeURIComponent(productId)}`);
    });
    return cancel;
  }, [productId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Redirecting to portfolio...</p>
      </div>
    </div>
  );
}