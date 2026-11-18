import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | LetHub",
  description: "Guides and updates for UK letting agents on the Renters' Rights Act, compliance and running a lettings business.",
  alternates: { canonical: "/blog" },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
