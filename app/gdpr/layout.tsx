import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR and data protection | LetHub",
  description: "How LetHub processes personal data under UK GDPR for letting agents, landlords and tenants.",
  alternates: { canonical: "/gdpr" },
};

export default function GdprLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
