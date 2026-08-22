import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF2F2]">
          <i className="ri-forbid-line text-3xl text-[#DC2626]"></i>
        </div>
        <h1 className="text-2xl font-bold text-[#3A3F3A]">Account suspended</h1>
        <p className="mt-3 text-sm leading-6 text-[#687068]">
          This account has been suspended. Please contact a platform administrator if you believe this is an error.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <SignOutButton className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C28A78] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B07A69] whitespace-nowrap" />
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-[#D5D9D5] px-6 py-2.5 text-sm font-medium text-[#687068] transition-colors hover:bg-[#F8FAFC] whitespace-nowrap"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}