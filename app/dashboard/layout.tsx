import AuthGuard from "@/components/auth/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans antialiased">
      <AuthGuard allowDemo showDemoBanner>
        {children}
      </AuthGuard>
    </div>
  );
}