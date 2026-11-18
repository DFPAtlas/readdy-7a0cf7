import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About LetHub | LetHub",
  description: "LetHub is UK property management software for letting agents and landlords, built around the Renters' Rights Act.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
