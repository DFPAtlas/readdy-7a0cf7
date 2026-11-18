import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press | LetHub",
  description: "News and media resources for LetHub.",
  alternates: { canonical: "/press" },
};

export default function PressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
