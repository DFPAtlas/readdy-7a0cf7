import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans | LetHub",
  description:
    "Compare LetHub's four pricing plans — Starter, Professional, Business and Enterprise — with transparent monthly and annual billing and a 14-day free trial.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}