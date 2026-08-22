import AuthGuard from "@/components/auth/AuthGuard";

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={["landlord"]}>{children}</AuthGuard>;
}