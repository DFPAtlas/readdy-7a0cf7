import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help | LetHub",
  description: "Answers to common questions about using LetHub.",
  alternates: { canonical: "/help" },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
