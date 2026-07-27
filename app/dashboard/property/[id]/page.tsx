import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LegacyPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Keep old bookmarks working while consolidating all live property detail
  // traffic on the Supabase-backed portfolio route.
  redirect(`/dashboard/portfolio/${encodeURIComponent(id)}`);
}
