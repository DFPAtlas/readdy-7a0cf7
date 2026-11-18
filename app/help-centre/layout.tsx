import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help centre | LetHub",
  description: "Guides and how-tos for getting the most out of LetHub.",
  alternates: { canonical: "/help-centre" },
};

export default function HelpCentreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
