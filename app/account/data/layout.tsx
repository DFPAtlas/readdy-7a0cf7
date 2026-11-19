import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your data | LetHub",
  robots: { index: false, follow: false },
};

export default function AccountDataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
