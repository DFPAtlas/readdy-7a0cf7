import DashboardShell from "@/components/DashboardShell";
import SupaAdminClient from "../supa-admin/SupaAdminClient";

export default function SuperAdminPage() {
  return (
    <DashboardShell>
      <SupaAdminClient />
    </DashboardShell>
  );
}