import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | LetHub",
  description:
    "Sign in to your LetHub account to manage your property portfolio, track compliance and handle maintenance requests.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}