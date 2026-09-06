import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an Enterprise Demo | LetHub",
  description:
    "Book a personalised LetHub Enterprise demo and get a tailored walkthrough from our team within 24 hours.",
};

export default function BookDemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}