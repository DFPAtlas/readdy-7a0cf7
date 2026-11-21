"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import {
  conditionLabel,
  countIssues,
  loadInspection,
  ratingFor,
  roomConditionScore,
  type FullInspection,
} from "@/lib/inspections";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const RATING_STYLE: Record<string, string> = {
  Excellent: "text-[#047857] bg-[#ECFDF5]",
  Good: "text-[#1D4ED8] bg-[#EFF6FF]",
  Fair: "text-[#B45309] bg-[#FFFBEB]",
  Poor: "text-[#B91C1C] bg-[#FEF2F2]",
};

export default function InspectionReportPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = useState<FullInspection | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isDemoAccount()) {
        setMessage("Inspection reports aren't available in the demo.");
        setState("missing");
        return;
      }
      try {
        const full = await loadInspection(supabase, id);
        if (cancelled) return;
        if (!full) {
          setMessage("This inspection doesn't exist or you don't have access to it.");
          setState("missing");
          return;
        }
        setData(full);
        setState("ready");
      } catch (err) {
        if (cancelled) return;
        console.error("report load failed", err);
        setMessage("We couldn't load this report. Check your connection and try again.");
        setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (state !== "ready" || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-sm text-center">
          <p className="text-sm text-[#3A3F3A]">{message}</p>
          <Link href="/dashboard/inspections" className="inline-block mt-4 px-4 py-2.5 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl">
            Back to inspections
          </Link>
        </div>
      </div>
    );
  }

  const { inspection, rooms, photos } = data;
  const isComplete = inspection.status === "completed";
  const rating = inspection.overallRating || (rooms.length > 0 ? ratingFor(rooms) : null);
  const issues = countIssues(rooms);
  const issueList = rooms.flatMap((room) =>
    room.items.filter((i) => i.status === "fail").map((item) => ({ room: room.name, item: item.name, note: item.note })),
  );
  const unassignedPhotos = photos.filter((p) => !p.roomId || !rooms.some((r) => r.id === p.roomId));

  return (
    <div className="min-h-screen bg-[#F1F5F9] print:bg-white">
      <div className="print:hidden bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard/inspections" className="text-sm text-[#687068] flex items-center gap-1">
            <i className="ri-arrow-left-line"></i> Inspections
          </Link>
          <div className="flex-1"></div>
          {!isComplete && inspection.status !== "cancelled" && (
            <Link href={`/dashboard/inspections/${inspection.id}/conduct`} className="px-4 py-2 text-sm font-medium text-[#C28A78] border border-[#C28A78]/40 rounded-lg">
              Continue inspection
            </Link>
          )}
          <button type="button" onClick={() => window.print()} className="px-4 py-2 text-sm font-medium bg-[#C28A78] text-white rounded-lg">
            <i className="ri-printer-line mr-1"></i>Print / Save as PDF
          </button>
        </div>
      </div>

      <article className="max-w-4xl mx-auto bg-white my-6 print:my-0 rounded-2xl print:rounded-none shadow-sm print:shadow-none p-6 sm:p-10 print:p-0 text-[#1F2937]">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#6B7280]">{inspection.typeLabel} report</p>
            <h1 className="text-2xl font-bold mt-1">{inspection.propertyName}</h1>
            <p className="text-sm text-[#4B5563] mt-1">{inspection.propertyAddress}</p>
          </div>
          <div className="text-right">
            {rating && <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${RATING_STYLE[rating]}`}>{rating}</span>}
            {!isComplete && <p className="text-xs text-[#B45309] mt-2">Draft – inspection not yet completed</p>}
          </div>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-[#E5E7EB] text-sm">
          <div>
            <p className="text-xs text-[#6B7280]">Inspection date</p>
            <p className="font-medium">{formatDate(inspection.completedDate || inspection.scheduledDate)}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Inspector</p>
            <p className="font-medium">{inspection.inspectorName || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Tenant{inspection.tenantNames.length === 1 ? "" : "s"}</p>
            <p className="font-medium">{inspection.tenantNames.join(", ") || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Rooms · issues</p>
            <p className="font-medium">{rooms.length} · {issues}</p>
          </div>
        </section>

        {inspection.generalNotes && (
          <section className="py-5 border-b border-[#E5E7EB]">
            <h2 className="text-sm font-semibold mb-2">Summary</h2>
            <p className="text-sm text-[#374151] whitespace-pre-wrap">{inspection.generalNotes}</p>
          </section>
        )}

        <section className="py-5 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold mb-3">Issues found</h2>
          {issueList.length === 0 ? (
            <p className="text-sm text-[#047857]">No issues were recorded.</p>
          ) : (
            <ol className="space-y-2 list-decimal list-inside text-sm">
              {issueList.map((issue, idx) => (
                <li key={idx}>
                  <span className="font-medium">{issue.room} – {issue.item}</span>
                  {issue.note ? <span className="text-[#4B5563]">: {issue.note}</span> : null}
                </li>
              ))}
            </ol>
          )}
        </section>

        {rooms.length === 0 && (
          <p className="py-5 text-sm text-[#6B7280]">No rooms have been recorded yet.</p>
        )}

        {rooms.map((room) => {
          const score = roomConditionScore(room);
          const roomPhotos = photos.filter((p) => p.roomId === room.id);
          return (
            <section key={room.id} className="py-5 border-b border-[#E5E7EB] break-inside-avoid-page">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold">{room.name}</h2>
                <span className="text-xs text-[#4B5563]">Condition: {conditionLabel(score)}</span>
              </div>
              {room.items.length > 0 && (
                <table className="w-full text-sm">
                  <tbody>
                    {room.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-[#F3F4F6] align-top">
                        <td className="py-1.5 pr-3">{item.name}</td>
                        <td className="py-1.5 pr-3 w-20 font-medium">
                          {item.status === "pass" && <span className="text-[#047857]">Pass</span>}
                          {item.status === "fail" && <span className="text-[#B91C1C]">Issue</span>}
                          {item.status === "na" && <span className="text-[#6B7280]">N/A</span>}
                          {!item.status && <span className="text-[#9CA3AF]">—</span>}
                        </td>
                        <td className="py-1.5 text-[#4B5563]">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {room.notes && <p className="text-sm text-[#374151] mt-3 whitespace-pre-wrap">{room.notes}</p>}
              {roomPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {roomPhotos.map((photo) => (
                    <figure key={photo.id} className="break-inside-avoid">
                      {photo.url ? (
                        <img src={photo.url} alt={photo.caption || `${room.name} photo`} className="w-full h-40 object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-40 rounded-lg bg-[#F3F4F6]"></div>
                      )}
                      <figcaption className="text-[11px] text-[#6B7280] mt-1">
                        {photo.caption ? `${photo.caption} · ` : ""}{formatDateTime(photo.takenAt)}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {unassignedPhotos.length > 0 && (
          <section className="py-5 border-b border-[#E5E7EB]">
            <h2 className="text-base font-semibold mb-3">Other photos</h2>
            <div className="grid grid-cols-3 gap-2">
              {unassignedPhotos.map((photo) =>
                photo.url ? (
                  <img key={photo.id} src={photo.url} alt={photo.caption || "Inspection photo"} className="w-full h-40 object-cover rounded-lg" />
                ) : null,
              )}
            </div>
          </section>
        )}

        <footer className="pt-5 text-sm">
          {inspection.signatureUrl ? (
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Signed</p>
              <img src={inspection.signatureUrl} alt="Signature" className="h-16" />
              <p className="mt-1">{inspection.signedByName || inspection.inspectorName} · {formatDateTime(inspection.signedAt)}</p>
            </div>
          ) : isComplete ? (
            <p className="text-xs text-[#6B7280]">Completed {formatDate(inspection.completedDate)} without a signature.</p>
          ) : null}
          <p className="text-[11px] text-[#9CA3AF] mt-6">Generated by LetHub · lethub.uk</p>
        </footer>
      </article>
    </div>
  );
}
