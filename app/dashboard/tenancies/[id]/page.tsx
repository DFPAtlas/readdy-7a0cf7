import TenancyDetail from "./TenancyDetail";
import { tenancies } from "../TenanciesData";

export async function generateStaticParams() {
  const ids = tenancies.map((t) => t.id);
  return ids.map((id) => ({ id }));
}

export default async function TenancyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TenancyDetail tenancyId={id} />;
}