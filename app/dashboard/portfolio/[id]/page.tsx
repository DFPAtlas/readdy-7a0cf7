import PropertyDetail from "./PropertyDetail";
import DashboardShell from "@/components/DashboardShell";

export async function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
  ];
}

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