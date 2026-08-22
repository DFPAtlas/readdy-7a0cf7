import AuthGuard from "@/components/auth/AuthGuard";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={["platform_admin"]}>{children}</AuthGuard>;
}