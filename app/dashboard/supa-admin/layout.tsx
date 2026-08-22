import AuthGuard from "@/components/auth/AuthGuard";

export default function SupaAdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={["platform_admin"]}>{children}</AuthGuard>;
}