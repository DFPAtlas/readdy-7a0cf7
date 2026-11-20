import ContractorDetail from "./ContractorDetail";
import { marketplaceContractors } from "../ContractorMarketplaceData";

export async function generateStaticParams() {
  const ids = marketplaceContractors.map((c) => c.id);
  const fallback = ["1", "2", "3", "4", "5", "6"];
  const all = Array.from(new Set([...ids, ...fallback]));
  return all.map((id) => ({ id }));
}

export default async function ContractorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContractorDetail contractorId={id} />;
}