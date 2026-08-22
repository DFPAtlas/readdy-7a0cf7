import AuthGuard from "@/components/auth/AuthGuard";

export default function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={["tenant"]}>{children}</AuthGuard>;
}