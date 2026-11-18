import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact us | LetHub",
  description: "Get in touch with the LetHub team about sales, support or partnerships.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
