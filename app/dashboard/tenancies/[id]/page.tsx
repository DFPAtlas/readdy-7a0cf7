import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import TenancyDetail from "./TenancyDetail";
import { tenancies } from "../TenanciesData";

export async function generateStaticParams() {
  return tenancies.map((t) => ({ id: t.id }));
}

export default async function TenancyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenancyExists = tenancies.some((tenancy) => tenancy.id === id);

  if (!tenancyExists) {
    return (
      <DashboardShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]">
              <i className="ri-file-search-line text-2xl text-[#94A3B8]"></i>
            </div>
            <h1 className="text-xl font-bold text-[#3A3F3A]">Tenancy not found</h1>
            <p className="mt-2 text-sm leading-6 text-[#687068]">
              This tenancy ID is not available in the current data source. LetHub will not substitute another tenancy record.
            </p>
            <Link
              href="/dashboard/tenancies"
              className="mt-5 inline-flex rounded-lg bg-[#C28A78] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Back to tenancies
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return <TenancyDetail tenancyId={id} />;
}
