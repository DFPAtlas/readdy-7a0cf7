import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Your Free Trial | LetHub",
  description:
    "Create your LetHub account and start a 14-day free trial — set up your agency profile, pick a plan and pay securely.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}