import DashboardShell from "@/components/DashboardShell";
import SupaAdminClient from "./SupaAdminClient";

export default function SupaAdminPage() {
  return (
    <DashboardShell>
      <SupaAdminClient />
    </DashboardShell>
  );
}