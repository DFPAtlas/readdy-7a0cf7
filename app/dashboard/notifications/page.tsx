import { supabase } from "@/lib/supabaseClient";
import NotificationCentreContent from "./NotificationCentreContent";
import DashboardShell from "@/components/DashboardShell";

export default function NotificationCentrePage() {
  return (
    <DashboardShell>
      <NotificationCentreContent />
    </DashboardShell>
  );
}