import ContractorDetail from "./ContractorDetail";
import DashboardShell from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

export default async function ContractorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardShell>
      <ContractorDetail contractorId={id} />
    </DashboardShell>
  );
}
