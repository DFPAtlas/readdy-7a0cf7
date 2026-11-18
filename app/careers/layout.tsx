import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | LetHub",
  description: "Work with LetHub.",
  alternates: { canonical: "/careers" },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
