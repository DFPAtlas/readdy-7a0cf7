import ContractorDetail from "./ContractorDetail";

export const dynamic = "force-dynamic";

export default async function ContractorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContractorDetail contractorId={id} />;
}
