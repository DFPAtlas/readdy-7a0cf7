import LegacyPropertyRedirect from './LegacyPropertyRedirect';

export async function generateStaticParams() {
  const ids = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
  return ids.map((id) => ({ id }));
}

export default async function LegacyPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LegacyPropertyRedirect productId={id} />;
}