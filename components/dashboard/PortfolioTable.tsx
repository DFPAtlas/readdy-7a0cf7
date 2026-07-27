"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  status: string;
  landlord: string;
  tenant: string;
  attentionReason?: string;
  lastInspection: string;
  nextInspection: string;
  nation?: string;
  epcRating?: string;
}

const statusStyles: Record<string, string> = {
  Occupied: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
  Available: "bg-[#3B82F6]/10 text-[#3B82F6]",
  Maintenance: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Pending: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
};

export default function PortfolioTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        const mapped: Property[] = data.map((p: any) => ({
          id: p.id,
          name: p.line1 || "—",
          address: [p.line1, p.city, p.postcode].filter(Boolean).join(", "),
          city: p.city || "—",
          postcode: p.postcode || "—",
          type: "—",
          bedrooms: p.bedrooms ?? 0,
          bathrooms: 0,
          rentAmount: 0,
          status: "—",
          landlord: "—",
          tenant: "—",
          lastInspection: "—",
          nextInspection: "—",
          nation: p.nation || "—",
          epcRating: p.epc_rating || "—",
        }));
        setProperties(mapped);
      }
      setLoading(false);
    };

    fetchProperties();
  }, []);

  const filtered = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#D5D9D5]">
          <h2 className="font-semibold text-[#3A3F3A]">Portfolio Overview</h2>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#D5D9D5]">
          <h2 className="font-semibold text-[#3A3F3A]">Portfolio Overview</h2>
        </div>
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-[#EBE5DA] rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-building-4-line text-[#94A3B8] text-2xl"></i>
          </div>
          <p className="text-lg font-medium text-[#3A3F3A]">No properties yet</p>
          <p className="text-sm text-[#687068] mt-1">Add your first property to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#D5D9D5]">
        <h2 className="font-semibold text-[#3A3F3A]">Portfolio Overview</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search portfolio..."
              className="text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent w-40"
            />
          </div>
          <Link
            href="/dashboard/portfolio"
            className="text-sm text-[#C28A78] font-medium hover:underline whitespace-nowrap"
          >
            View all
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#D5D9D5]">
              <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Property</th>
              <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase hidden md:table-cell">Nation</th>
              <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase hidden md:table-cell">Bedrooms</th>
              <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase hidden lg:table-cell">EPC</th>
              <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase hidden lg:table-cell">Status</th>
              <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D5D9D5]">
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-building-4-line text-[#C28A78] text-sm"></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#3A3F3A] truncate">{p.name}</p>
                      <p className="text-xs text-[#687068] truncate">{p.city}, {p.postcode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-[#687068] hidden md:table-cell capitalize">{p.nation}</td>
                <td className="px-5 py-3.5 text-sm text-[#3A3F3A] hidden md:table-cell">{p.bedrooms || "—"}</td>
                <td className="px-5 py-3.5 text-sm text-[#3A3F3A] hidden lg:table-cell">{p.epcRating || "—"}</td>
                <td className="px-5 py-3.5 text-sm text-[#687068] hidden lg:table-cell">—</td>
                <td className="px-5 py-3.5">
                  <i className={`ri-arrow-down-s-line text-[#94A3B8] transition-transform ${expanded === p.id ? "rotate-180" : ""}`}></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && properties.length > 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-[#EBE5DA] rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="ri-search-line text-[#94A3B8] text-xl"></i>
          </div>
          <p className="text-sm text-[#687068]">No properties match your search</p>
        </div>
      )}
    </div>
  );
}