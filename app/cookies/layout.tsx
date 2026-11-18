import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie policy | LetHub",
  description: "How LetHub uses cookies and similar technologies, and how to manage your preferences.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
