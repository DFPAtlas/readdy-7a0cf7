import type { ChecklistItem, InspectionRoom, ItemStatus } from "@/lib/inspections";

// A copy of an in-progress inspection kept on this device, so nothing is lost
// if the signal drops mid-inspection. The server copy is the record; this is
// only used when it holds changes the server hasn't received yet.

export type LocalDraft = {
  rooms: InspectionRoom[];
  generalNotes: string;
  savedAt: string;
  synced: boolean;
};

const key = (inspectionId: string) => `lethub_inspection_draft_v2_${inspectionId}`;

function isStatus(value: unknown): value is ItemStatus {
  return value === "pass" || value === "fail" || value === "na";
}

function readItem(value: unknown): ChecklistItem | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.name !== "string") return null;
  return { name: v.name, status: isStatus(v.status) ? v.status : null, note: typeof v.note === "string" ? v.note : "" };
}

function readRoom(value: unknown, index: number): InspectionRoom | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string" || typeof v.name !== "string" || !Array.isArray(v.items)) return null;
  return {
    id: v.id,
    name: v.name,
    templateId: typeof v.templateId === "string" ? v.templateId : null,
    items: v.items.map(readItem).filter((i): i is ChecklistItem => i !== null),
    notes: typeof v.notes === "string" ? v.notes : "",
    sortOrder: index,
  };
}

export function loadLocalDraft(inspectionId: string): LocalDraft | null {
  try {
    const raw = window.localStorage.getItem(key(inspectionId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const p = parsed as Record<string, unknown>;
    if (!Array.isArray(p.rooms)) return null;
    return {
      rooms: p.rooms.map(readRoom).filter((r): r is InspectionRoom => r !== null),
      generalNotes: typeof p.generalNotes === "string" ? p.generalNotes : "",
      savedAt: typeof p.savedAt === "string" ? p.savedAt : new Date(0).toISOString(),
      synced: p.synced === true,
    };
  } catch {
    return null;
  }
}

export function saveLocalDraft(inspectionId: string, draft: LocalDraft): void {
  try {
    window.localStorage.setItem(key(inspectionId), JSON.stringify(draft));
  } catch {
    // Storage full or unavailable; the server copy still saves when online.
  }
}

export function clearLocalDraft(inspectionId: string): void {
  try {
    window.localStorage.removeItem(key(inspectionId));
  } catch {
    // Ignore.
  }
}
