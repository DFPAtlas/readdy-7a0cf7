import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Product Demo | LetHub",
  description:
    "Try LetHub's free interactive estate agent demo — explore 42 sample properties, compliance records and portal setup with no sign-up.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}