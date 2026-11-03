import LegacyPropertyRedirect from './LegacyPropertyRedirect';

export default async function LegacyPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LegacyPropertyRedirect productId={id} />;
}