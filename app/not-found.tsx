import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FBF9F4] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-['Pacifico'] text-3xl text-[#C28A78]">LetHub</p>
        <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-[#C28A78]">404</p>
        <h1 className="mt-2 text-2xl font-bold text-[#3A3F3A]">We couldn&apos;t find that page</h1>
        <p className="mt-3 text-sm leading-6 text-[#687068]">
          The link may be out of date, or the page may have moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="rounded-lg bg-[#C28A78] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B07A69]">
            Go to the homepage
          </Link>
          <Link href="/login" className="rounded-lg border border-[#D5D9D5] px-5 py-2.5 text-sm font-semibold text-[#3A3F3A] hover:bg-white">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
