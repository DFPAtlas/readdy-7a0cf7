import ContractorDetail from "./ContractorDetail";

export async function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
    { id: "6" },
    { id: "7" },
    { id: "8" },
    { id: "9" },
    { id: "10" },
    { id: "11" },
    { id: "12" },
  ];
}

export default async function ContractorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContractorDetail contractorId={id} />;
}