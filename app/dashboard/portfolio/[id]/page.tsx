import PropertyDetail from "./PropertyDetail";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PropertyDetail propertyId={id} />;
}
