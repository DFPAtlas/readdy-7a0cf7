import TenancyDetail from "./TenancyDetail";

export default async function TenancyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TenancyDetail tenancyId={id} />;
}
