import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partners and integrations | LetHub",
  description: "Integrations and partners that work with LetHub.",
  alternates: { canonical: "/partners" },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
