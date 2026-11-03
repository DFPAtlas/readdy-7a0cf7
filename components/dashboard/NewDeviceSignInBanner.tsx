"use client";

import Link from "next/link";
import { formatAlertTime, useNewDeviceAlert } from "@/lib/deviceTrust";

export default function NewDeviceSignInBanner() {
  const { alert, loading, dismiss } = useNewDeviceAlert();

  if (loading || !alert) return null;

  const when = formatAlertTime(alert.signedInAt);

  return (
    <div className="mb-5 rounded-xl border border-[#F5D9A8] bg-[#FEF8EC] p-4 shadow-[0_1px_10px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FCEBCB] flex-shrink-0">
            <i className="ri-shield-keyhole-line text-lg text-[#B4761F]"></i>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#8A5A12]">
              New device signed in to your account
            </p>
            <p className="mt-1 text-sm leading-6 text-[#6B5A3C]">
              We haven&apos;t seen this device before: <span className="font-semibold text-[#3A3F3A]">{alert.deviceLabel}</span>
              {when ? <> &middot; {when}</> : null}
              {alert.previousDevice ? (
                <>
                  {" "}
                  &middot; Your last sign-in was from{" "}
                  <span className="font-medium text-[#3A3F3A]">{alert.previousDevice}</span>
                </>
              ) : null}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#8A7A5C]">
              If this was you, you can dismiss this warning. If not, secure your account and sign out of other sessions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-[52px] lg:pl-0 flex-shrink-0">
          <button
            onClick={dismiss}
            className="cursor-pointer whitespace-nowrap rounded-lg border border-[#E3C99A] bg-white px-3.5 py-2 text-xs font-semibold text-[#8A5A12] transition-colors hover:bg-[#FDF3E3]"
          >
            That was me
          </button>
          <Link
            href="/dashboard/settings"
            className="cursor-pointer whitespace-nowrap rounded-lg bg-[#B4761F] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9C6418]"
          >
            Secure my account
          </Link>
        </div>
      </div>
    </div>
  );
}