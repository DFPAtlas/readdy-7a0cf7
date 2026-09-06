import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Trust | LetHub",
  description:
    "See how LetHub protects your data with AES-256 encryption, role-based access control and UK GDPR compliance.",
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}