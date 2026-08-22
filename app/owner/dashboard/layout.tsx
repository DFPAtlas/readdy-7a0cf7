import AuthGuard from "@/components/auth/AuthGuard";

export default function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={["landlord"]}>{children}</AuthGuard>;
}