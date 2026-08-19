import LegacyPropertyRedirect from './LegacyPropertyRedirect';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function LegacyPropertyPage({ params }: { params: { id: string } }) {
  return <LegacyPropertyRedirect productId={params.id} />;
}