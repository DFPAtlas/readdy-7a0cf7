import TenancyDetail from "./TenancyDetail";

export async function generateStaticParams() {
  return [
    { id: "tncy-001" },
    { id: "tncy-002" },
    { id: "tncy-003" },
    { id: "tncy-004" },
    { id: "tncy-005" },
    { id: "tncy-006" },
    { id: "tncy-007" },
    { id: "tncy-008" },
    { id: "tncy-009" },
    { id: "tncy-010" },
  ];
}

export default async function TenancyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TenancyDetail tenancyId={id} />;
}