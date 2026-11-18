"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#FBF9F4] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-['Pacifico'] text-3xl text-[#C28A78]">LetHub</p>
        <h1 className="mt-8 text-2xl font-bold text-[#3A3F3A]">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-[#687068]">
          This page hit an unexpected problem. Please try again. If it keeps happening, email{" "}
          <a href="mailto:support@lethub.uk" className="font-medium text-[#C28A78] hover:underline">support@lethub.uk</a>
          {error.digest ? <> and quote reference <span className="font-mono">{error.digest}</span></> : null}.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={reset} className="rounded-lg bg-[#C28A78] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B07A69]">
            Try again
          </button>
          <Link href="/" className="rounded-lg border border-[#D5D9D5] px-5 py-2.5 text-sm font-semibold text-[#3A3F3A] hover:bg-white">
            Go to the homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
