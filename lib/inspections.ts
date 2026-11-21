import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/database.types";

// Reading and saving property inspections: the inspection itself, its rooms
// (each with a pass/fail/N/A checklist) and photos kept in the private
// "inspections" storage bucket under <agency id>/<inspection id>/.

type Client = SupabaseClient<Database>;

export const PHOTO_BUCKET = "inspections";

export type ItemStatus = "pass" | "fail" | "na";

export type ChecklistItem = {
  name: string;
  status: ItemStatus | null;
  note: string;
};

export type InspectionRoom = {
  id: string;
  templateId: string | null;
  name: string;
  items: ChecklistItem[];
  notes: string;
  sortOrder: number;
};

export type InspectionPhoto = {
  id: string;
  roomId: string | null;
  storagePath: string;
  caption: string | null;
  takenAt: string | null;
  url: string | null;
};

export type Rating = "Excellent" | "Good" | "Fair" | "Poor";

export type InspectionStatus = Database["public"]["Enums"]["inspection_status"];

export type InspectionRecord = {
  id: string;
  propertyId: string;
  agencyId: string | null;
  propertyName: string;
  propertyAddress: string;
  tenantNames: string[];
  title: string;
  type: string;
  typeLabel: string;
  status: InspectionStatus;
  scheduledDate: string;
  completedDate: string | null;
  startedAt: string | null;
  inspectorName: string;
  generalNotes: string;
  overallRating: Rating | null;
  signaturePath: string | null;
  signatureUrl: string | null;
  signedByName: string | null;
  signedAt: string | null;
};

export type FullInspection = {
  inspection: InspectionRecord;
  rooms: InspectionRoom[];
  photos: InspectionPhoto[];
};

export const INSPECTION_TYPES: { value: string; label: string; icon: string }[] = [
  { value: "routine", label: "Routine Inspection", icon: "ri-refresh-line" },
  { value: "check_in", label: "Move In", icon: "ri-login-box-line" },
  { value: "mid_term", label: "Mid-Term Inspection", icon: "ri-calendar-check-line" },
  { value: "check_out", label: "Move Out", icon: "ri-logout-box-line" },
];

export function inspectionTypeLabel(value: string | null | undefined): string {
  const v = (value || "").toLowerCase();
  if (v === "move_in") return "Move In";
  if (v === "move_out") return "Move Out";
  if (v === "interim") return "Mid-Term Inspection";
  return INSPECTION_TYPES.find((t) => t.value === v)?.label || "Routine Inspection";
}

function isRating(value: string | null | undefined): value is Rating {
  return value === "Excellent" || value === "Good" || value === "Fair" || value === "Poor";
}

function isItemStatus(value: Json | undefined): value is ItemStatus {
  return value === "pass" || value === "fail" || value === "na";
}

/** Reads a stored checklist, ignoring anything that isn't a well-formed item. */
export function parseChecklist(value: Json): ChecklistItem[] {
  if (!Array.isArray(value)) return [];
  const items: ChecklistItem[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const name = entry.name;
    if (typeof name !== "string" || !name.trim()) continue;
    const status = entry.status;
    const note = entry.note;
    items.push({
      name,
      status: isItemStatus(status) ? status : null,
      note: typeof note === "string" ? note : "",
    });
  }
  return items;
}

export function countIssues(rooms: InspectionRoom[]): number {
  return rooms.reduce((sum, room) => sum + room.items.filter((i) => i.status === "fail").length, 0);
}

export function progressOf(rooms: InspectionRoom[]): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const room of rooms) {
    for (const item of room.items) {
      total += 1;
      if (item.status) done += 1;
    }
  }
  return { done, total };
}

export function ratingFor(rooms: InspectionRoom[]): Rating {
  const issues = countIssues(rooms);
  if (issues === 0) return "Excellent";
  if (issues <= 3) return "Good";
  if (issues <= 6) return "Fair";
  return "Poor";
}

/** 1-5 room condition from the share of answered items that failed. */
export function roomConditionScore(room: InspectionRoom): number | null {
  const answered = room.items.filter((i) => i.status === "pass" || i.status === "fail");
  if (answered.length === 0) return null;
  const failRatio = answered.filter((i) => i.status === "fail").length / answered.length;
  if (failRatio === 0) return 5;
  if (failRatio <= 0.1) return 4;
  if (failRatio <= 0.25) return 3;
  if (failRatio <= 0.5) return 2;
  return 1;
}

export function conditionLabel(score: number | null): string {
  if (score === null) return "Not inspected";
  if (score >= 5) return "Excellent";
  if (score === 4) return "Good";
  if (score === 3) return "Fair";
  return "Poor";
}

export function newRoomId(): string {
  return crypto.randomUUID();
}

async function signedUrlMap(client: Client, paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (paths.length === 0) return map;
  const { data, error } = await client.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 60 * 60);
  if (error) throw error;
  for (const entry of data || []) {
    if (entry.path && entry.signedUrl) map.set(entry.path, entry.signedUrl);
  }
  return map;
}

/** Loads an inspection with its property, tenants, rooms and photos. Returns null if not found or not visible. */
export async function loadInspection(client: Client, id: string): Promise<FullInspection | null> {
  const { data: row, error } = await client
    .from("inspections")
    .select("id, property_id, tenancy_id, title, inspection_type, status, scheduled_date, completed_date, started_at, inspector_name, inspector_notes, overall_rating, signature_path, signed_by_name, signed_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;

  const { data: property, error: propertyError } = await client
    .from("properties")
    .select("id, line1, line2, city, postcode, landlord_id, managing_agency_id")
    .eq("id", row.property_id)
    .maybeSingle();
  if (propertyError) throw propertyError;

  let agencyId = property?.managing_agency_id || null;
  if (!agencyId && property?.landlord_id) {
    const { data: landlord, error: landlordError } = await client
      .from("landlords")
      .select("managing_agency_id")
      .eq("id", property.landlord_id)
      .maybeSingle();
    if (landlordError) throw landlordError;
    agencyId = landlord?.managing_agency_id || null;
  }

  // Tenants: those on the inspection's tenancy, else on the property's active tenancy.
  let tenancyId = row.tenancy_id;
  if (!tenancyId) {
    const { data: active, error: activeError } = await client
      .from("tenancies")
      .select("id")
      .eq("property_id", row.property_id)
      .eq("status", "active")
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (activeError) throw activeError;
    tenancyId = active?.id || null;
  }
  let tenantNames: string[] = [];
  if (tenancyId) {
    const { data: parties, error: partiesError } = await client
      .from("tenancy_parties")
      .select("tenant_id")
      .eq("tenancy_id", tenancyId);
    if (partiesError) throw partiesError;
    const tenantIds = (parties || []).map((p) => p.tenant_id);
    if (tenantIds.length > 0) {
      const { data: tenants, error: tenantsError } = await client
        .from("tenants")
        .select("full_name")
        .in("id", tenantIds);
      if (tenantsError) throw tenantsError;
      tenantNames = (tenants || []).map((t) => t.full_name).filter((n): n is string => Boolean(n));
    }
  }

  const { data: roomRows, error: roomsError } = await client
    .from("inspection_rooms")
    .select("id, room_name, template_id, checklist, notes, sort_order")
    .eq("inspection_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (roomsError) throw roomsError;

  const { data: photoRows, error: photosError } = await client
    .from("inspection_photos")
    .select("id, room_id, storage_path, caption, taken_at, created_at")
    .eq("inspection_id", id)
    .order("created_at", { ascending: true });
  if (photosError) throw photosError;

  const paths = (photoRows || []).map((p) => p.storage_path);
  if (row.signature_path) paths.push(row.signature_path);
  const urls = await signedUrlMap(client, paths);

  const address = property
    ? [property.line1, property.line2, property.city, property.postcode].filter(Boolean).join(", ")
    : "";

  return {
    inspection: {
      id: row.id,
      propertyId: row.property_id,
      agencyId,
      propertyName: property?.line1 || "Property",
      propertyAddress: address,
      tenantNames,
      title: row.title,
      type: row.inspection_type,
      typeLabel: inspectionTypeLabel(row.inspection_type),
      status: row.status,
      scheduledDate: row.scheduled_date,
      completedDate: row.completed_date,
      startedAt: row.started_at,
      inspectorName: row.inspector_name || "",
      generalNotes: row.inspector_notes || "",
      overallRating: isRating(row.overall_rating) ? row.overall_rating : null,
      signaturePath: row.signature_path,
      signatureUrl: row.signature_path ? urls.get(row.signature_path) || null : null,
      signedByName: row.signed_by_name,
      signedAt: row.signed_at,
    },
    rooms: (roomRows || []).map((r) => ({
      id: r.id,
      templateId: r.template_id,
      name: r.room_name,
      items: parseChecklist(r.checklist),
      notes: r.notes || "",
      sortOrder: r.sort_order,
    })),
    photos: (photoRows || []).map((p) => ({
      id: p.id,
      roomId: p.room_id,
      storagePath: p.storage_path,
      caption: p.caption,
      takenAt: p.taken_at || p.created_at,
      url: urls.get(p.storage_path) || null,
    })),
  };
}

export type NewInspection = {
  propertyId: string;
  type: string;
  scheduledDate: string;
  inspectorName: string;
  notes: string;
  startNow: boolean;
};

export async function createInspection(client: Client, input: NewInspection): Promise<string> {
  const { data: { user } } = await client.auth.getUser();
  const { data: tenancy, error: tenancyError } = await client
    .from("tenancies")
    .select("id")
    .eq("property_id", input.propertyId)
    .eq("status", "active")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (tenancyError) throw tenancyError;

  const { data, error } = await client
    .from("inspections")
    .insert({
      property_id: input.propertyId,
      tenancy_id: tenancy?.id || null,
      title: inspectionTypeLabel(input.type),
      inspection_type: input.type,
      scheduled_date: input.scheduledDate,
      inspector_name: input.inspectorName.trim() || null,
      inspector_notes: input.notes.trim() || null,
      status: input.startNow ? "in_progress" : "scheduled",
      started_at: input.startNow ? new Date().toISOString() : null,
      created_by: user?.id || null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Marks a scheduled inspection as in progress the first time it is opened. */
export async function markStarted(client: Client, inspection: InspectionRecord, inspectorName: string): Promise<void> {
  if (inspection.status !== "scheduled") return;
  const { error } = await client
    .from("inspections")
    .update({
      status: "in_progress",
      started_at: new Date().toISOString(),
      inspector_name: inspection.inspectorName || inspectorName || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inspection.id)
    .eq("status", "scheduled");
  if (error) throw error;
}

/** Writes every room as it stands and removes rooms that were deleted. */
export async function saveRooms(
  client: Client,
  inspectionId: string,
  rooms: InspectionRoom[],
  generalNotes: string,
): Promise<void> {
  const now = new Date().toISOString();
  if (rooms.length > 0) {
    const { error } = await client.from("inspection_rooms").upsert(
      rooms.map((room, index) => ({
        id: room.id,
        inspection_id: inspectionId,
        room_name: room.name.slice(0, 120),
        template_id: room.templateId,
        checklist: room.items,
        notes: room.notes || null,
        condition_rating: roomConditionScore(room),
        sort_order: index,
        updated_at: now,
      })),
      { onConflict: "id" },
    );
    if (error) throw error;
  }

  const keep = rooms.map((r) => r.id);
  let removal = client.from("inspection_rooms").delete().eq("inspection_id", inspectionId);
  if (keep.length > 0) removal = removal.not("id", "in", `(${keep.join(",")})`);
  const { error: deleteError } = await removal;
  if (deleteError) throw deleteError;

  const { error: notesError } = await client
    .from("inspections")
    .update({ inspector_notes: generalNotes.trim() || null, updated_at: now })
    .eq("id", inspectionId);
  if (notesError) throw notesError;
}

/** Shrinks a camera photo to at most 1600px on its long side as a JPEG. */
async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.75));
    return blob || file;
  } catch {
    return file;
  }
}

export async function uploadPhoto(
  client: Client,
  params: { agencyId: string; inspectionId: string; roomId: string | null; file: File; caption: string },
): Promise<InspectionPhoto> {
  const blob = await compressImage(params.file);
  const path = `${params.agencyId}/${params.inspectionId}/${crypto.randomUUID()}.jpg`;
  const { error: uploadError } = await client.storage
    .from(PHOTO_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (uploadError) throw uploadError;

  const takenAt = new Date().toISOString();
  const { data, error } = await client
    .from("inspection_photos")
    .insert({
      inspection_id: params.inspectionId,
      room_id: params.roomId,
      storage_path: path,
      caption: params.caption.trim() || null,
      taken_at: takenAt,
    })
    .select("id")
    .single();
  if (error) {
    await client.storage.from(PHOTO_BUCKET).remove([path]);
    throw error;
  }

  const urls = await signedUrlMap(client, [path]);
  return {
    id: data.id,
    roomId: params.roomId,
    storagePath: path,
    caption: params.caption.trim() || null,
    takenAt,
    url: urls.get(path) || null,
  };
}

export async function deletePhoto(client: Client, photo: InspectionPhoto): Promise<void> {
  const { error } = await client.from("inspection_photos").delete().eq("id", photo.id);
  if (error) throw error;
  // The row is gone either way; a leftover file is harmless and private.
  await client.storage.from(PHOTO_BUCKET).remove([photo.storagePath]);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = /data:([^;]+);/.exec(header)?.[1] || "image/png";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) buffer[i] = bytes.charCodeAt(i);
  return new Blob([buffer], { type: mime });
}

export async function completeInspection(
  client: Client,
  params: {
    inspection: InspectionRecord;
    rooms: InspectionRoom[];
    generalNotes: string;
    signatureDataUrl: string | null;
    signerName: string;
  },
): Promise<void> {
  const { inspection, rooms, generalNotes, signatureDataUrl, signerName } = params;
  await saveRooms(client, inspection.id, rooms, generalNotes);

  let signaturePath: string | null = null;
  if (signatureDataUrl && inspection.agencyId) {
    signaturePath = `${inspection.agencyId}/${inspection.id}/signature.png`;
    const { error: sigError } = await client.storage
      .from(PHOTO_BUCKET)
      .upload(signaturePath, dataUrlToBlob(signatureDataUrl), { contentType: "image/png", upsert: true });
    if (sigError) throw sigError;
  }

  const now = new Date();
  const signedBy = signaturePath ? signerName.trim() || inspection.inspectorName || null : null;
  const signedAt = signaturePath ? now.toISOString() : null;
  const { error } = await client
    .from("inspections")
    .update({
      status: "completed",
      completed_date: now.toISOString().slice(0, 10),
      overall_rating: ratingFor(rooms),
      inspector_notes: generalNotes.trim() || null,
      signature_path: signaturePath,
      signed_by_name: signedBy,
      signed_at: signedAt,
      updated_at: now.toISOString(),
    })
    .eq("id", inspection.id);
  if (error) throw error;
}
