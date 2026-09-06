import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations & Partners | LetHub",
  description:
    "Connect LetHub to Xero, Stripe, GoCardless, Rightmove, Zoopla and Zapier to unify your property management stack.",
};

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}