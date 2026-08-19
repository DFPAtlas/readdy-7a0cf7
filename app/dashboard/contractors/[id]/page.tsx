import ContractorDetail from "./ContractorDetail";

export function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
  ];
}

export default function ContractorPage({ params }: { params: { id: string } }) {
  return <ContractorDetail contractorId={params.id} />;
}