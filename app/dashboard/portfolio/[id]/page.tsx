import PropertyDetail from "./PropertyDetail";
import DashboardShell from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardShell>
      <PropertyDetail propertyId={id} />
    </DashboardShell>
  );
}
