import AuthGuard from "@/components/auth/AuthGuard";

export default function ContractorDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={["contractor"]}>{children}</AuthGuard>;
}