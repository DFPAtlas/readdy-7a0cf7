import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy | LetHub",
  description: "How LetHub collects, uses and protects personal data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
