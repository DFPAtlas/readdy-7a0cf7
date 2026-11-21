"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import { ROOM_TEMPLATES, templateFor } from "@/lib/inspectionTemplates";
import {
  completeInspection,
  countIssues,
  deletePhoto,
  loadInspection,
  markStarted,
  newRoomId,
  progressOf,
  saveRooms,
  uploadPhoto,
  type InspectionPhoto,
  type InspectionRecord,
  type InspectionRoom,
  type ItemStatus,
} from "@/lib/inspections";
import { clearLocalDraft, loadLocalDraft, saveLocalDraft } from "@/lib/inspectionDraft";
import RoomChecklist from "./RoomChecklist";
import SignaturePad from "./SignaturePad";

type Phase = "loading" | "ready" | "unavailable" | "error";
type SyncState = "saved" | "pending" | "saving" | "offline" | "error";

const SYNC_LABEL: Record<SyncState, { text: string; dot: string }> = {
  saved: { text: "Saved", dot: "bg-[#10B981]" },
  pending: { text: "Saving…", dot: "bg-[#F59E0B]" },
  saving: { text: "Saving…", dot: "bg-[#F59E0B]" },
  offline: { text: "Offline – saved on this device", dot: "bg-[#F59E0B]" },
  error: { text: "Not saved – will retry", dot: "bg-[#EF4444]" },
};

function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string" && err.message) return err.message;
  return fallback;
}

export default function ConductInspectionPage() {
  const params = useParams<{ id: string }>();
  const inspectionId = params.id;
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("loading");
  const [unavailableReason, setUnavailableReason] = useState("");
  const [inspection, setInspection] = useState<InspectionRecord | null>(null);
  const [rooms, setRooms] = useState<InspectionRoom[]>([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [photos, setPhotos] = useState<InspectionPhoto[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sync, setSync] = useState<SyncState>("saved");
  const [restored, setRestored] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [customRoomName, setCustomRoomName] = useState("");
  const [showSign, setShowSign] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [uploadingRoomId, setUploadingRoomId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [inspectorName, setInspectorName] = useState("");

  // The latest edits, read by the background save so it never sends stale data.
  const latest = useRef<{ rooms: InspectionRoom[]; generalNotes: string }>({ rooms: [], generalNotes: "" });
  const version = useRef(0);
  const savedVersion = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef<Promise<boolean> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const persist = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) await inFlight.current;
    if (version.current === savedVersion.current) return true;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSync("offline");
      return false;
    }
    const target = version.current;
    const snapshot = latest.current;
    setSync("saving");
    const run = (async () => {
      try {
        await saveRooms(supabase, inspectionId, snapshot.rooms, snapshot.generalNotes);
        savedVersion.current = Math.max(savedVersion.current, target);
        const upToDate = version.current === savedVersion.current;
        saveLocalDraft(inspectionId, {
          rooms: snapshot.rooms,
          generalNotes: snapshot.generalNotes,
          savedAt: new Date().toISOString(),
          synced: upToDate,
        });
        setSync(upToDate ? "saved" : "pending");
        return true;
      } catch (err) {
        console.error("inspection save failed", err);
        setSync(navigator.onLine ? "error" : "offline");
        return false;
      }
    })();
    inFlight.current = run;
    const ok = await run;
    inFlight.current = null;
    if (ok && version.current !== savedVersion.current) {
      return persist();
    }
    return ok;
  }, [inspectionId]);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void persist();
    }, 1200);
  }, [persist]);

  const saveNow = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    return persist();
  }, [persist]);

  const commit = useCallback((nextRooms: InspectionRoom[], nextNotes: string) => {
    latest.current = { rooms: nextRooms, generalNotes: nextNotes };
    version.current += 1;
    setRooms(nextRooms);
    setGeneralNotes(nextNotes);
    saveLocalDraft(inspectionId, { rooms: nextRooms, generalNotes: nextNotes, savedAt: new Date().toISOString(), synced: false });
    setSync(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "pending");
    scheduleSave();
  }, [inspectionId, scheduleSave]);

  const updateRoom = useCallback((roomId: string, change: (room: InspectionRoom) => InspectionRoom) => {
    const next = latest.current.rooms.map((r) => (r.id === roomId ? change(r) : r));
    commit(next, latest.current.generalNotes);
  }, [commit]);

  // Load the inspection, preferring unsynced changes kept on this device.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isDemoAccount()) {
        setUnavailableReason("Inspections can't be carried out in the demo. Sign up to run real inspections.");
        setPhase("unavailable");
        return;
      }
      try {
        const full = await loadInspection(supabase, inspectionId);
        if (cancelled) return;
        if (!full) {
          setUnavailableReason("This inspection doesn't exist or you don't have access to it.");
          setPhase("unavailable");
          return;
        }
        if (full.inspection.status === "completed") {
          router.replace(`/dashboard/inspections/${inspectionId}/report`);
          return;
        }
        if (full.inspection.status === "cancelled") {
          setUnavailableReason("This inspection was cancelled.");
          setPhase("unavailable");
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        let name = full.inspection.inspectorName;
        if (!name && user) {
          const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
          name = profile?.full_name || "";
        }
        if (cancelled) return;
        setInspectorName(name);

        const local = loadLocalDraft(inspectionId);
        const useLocal = Boolean(local && !local.synced);
        const startRooms = useLocal && local ? local.rooms : full.rooms;
        const startNotes = useLocal && local ? local.generalNotes : full.inspection.generalNotes;

        latest.current = { rooms: startRooms, generalNotes: startNotes };
        setRooms(startRooms);
        setGeneralNotes(startNotes);
        setPhotos(full.photos);
        setInspection({ ...full.inspection, inspectorName: name, status: full.inspection.status === "scheduled" ? "in_progress" : full.inspection.status });
        setPhase("ready");

        if (useLocal) {
          setRestored(true);
          version.current = 1;
          scheduleSave();
        }
        if (full.inspection.status === "scheduled") {
          markStarted(supabase, full.inspection, name).catch((err) => console.error("could not mark inspection started", err));
        }
      } catch (err) {
        if (cancelled) return;
        console.error("inspection load failed", err);
        setUnavailableReason(errorMessage(err, "We couldn't load this inspection."));
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inspectionId]);

  useEffect(() => {
    const onOnline = () => {
      if (version.current !== savedVersion.current) void persist();
    };
    const onOffline = () => {
      if (version.current !== savedVersion.current) setSync("offline");
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (version.current !== savedVersion.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [persist]);

  const addRoom = (templateId: string | null, name: string) => {
    const template = templateFor(templateId);
    const existing = latest.current.rooms.filter((r) => r.name === name || r.name.startsWith(`${name} `)).length;
    const room: InspectionRoom = {
      id: newRoomId(),
      templateId: template?.id || null,
      name: existing > 0 ? `${name} ${existing + 1}` : name,
      items: (template?.items || []).map((item) => ({ name: item, status: null, note: "" })),
      notes: "",
      sortOrder: latest.current.rooms.length,
    };
    const next = [...latest.current.rooms, room];
    commit(next, latest.current.generalNotes);
    setActiveIndex(next.length - 1);
    setShowAddRoom(false);
    setCustomRoomName("");
  };

  const removeRoom = async (room: InspectionRoom) => {
    const roomPhotos = photos.filter((p) => p.roomId === room.id);
    const message = roomPhotos.length > 0
      ? `Remove ${room.name} and its ${roomPhotos.length} photo${roomPhotos.length === 1 ? "" : "s"}?`
      : `Remove ${room.name}?`;
    if (!window.confirm(message)) return;
    if (roomPhotos.length > 0) {
      if (!navigator.onLine) {
        showToast("You're offline. Reconnect to remove a room that has photos.");
        return;
      }
      try {
        for (const photo of roomPhotos) await deletePhoto(supabase, photo);
        setPhotos((prev) => prev.filter((p) => p.roomId !== room.id));
      } catch (err) {
        showToast(errorMessage(err, "Couldn't remove the room's photos. Try again."));
        return;
      }
    }
    const next = latest.current.rooms.filter((r) => r.id !== room.id);
    commit(next, latest.current.generalNotes);
    setActiveIndex((i) => Math.max(0, Math.min(i, next.length - 1)));
  };

  const addPhoto = async (room: InspectionRoom, file: File, caption: string) => {
    if (!inspection?.agencyId) return;
    if (!navigator.onLine) {
      showToast("Photos need a connection. Reconnect and try again.");
      return;
    }
    setUploadingRoomId(room.id);
    try {
      // The room must exist on the server before a photo can be linked to it.
      const saved = await saveNow();
      if (!saved) throw new Error("Couldn't save the room before uploading. Try again.");
      const photo = await uploadPhoto(supabase, {
        agencyId: inspection.agencyId,
        inspectionId,
        roomId: room.id,
        file,
        caption,
      });
      setPhotos((prev) => [...prev, photo]);
    } catch (err) {
      showToast(errorMessage(err, "The photo couldn't be uploaded. Try again."));
    } finally {
      setUploadingRoomId(null);
    }
  };

  const removePhoto = async (photo: InspectionPhoto) => {
    if (!window.confirm("Remove this photo?")) return;
    try {
      await deletePhoto(supabase, photo);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      showToast(errorMessage(err, "Couldn't remove the photo. Try again."));
    }
  };

  const startCompletion = () => {
    if (latest.current.rooms.length === 0) {
      showToast("Add at least one room before completing the inspection.");
      return;
    }
    const { done, total } = progressOf(latest.current.rooms);
    if (done < total && !window.confirm(`${total - done} checklist item${total - done === 1 ? " is" : "s are"} still unanswered. Complete anyway?`)) {
      return;
    }
    const missingNotes = latest.current.rooms.reduce((sum, r) => sum + r.items.filter((i) => i.status === "fail" && !i.note.trim()).length, 0);
    if (missingNotes > 0 && !window.confirm(`${missingNotes} issue${missingNotes === 1 ? " has" : "s have"} no description. Complete anyway?`)) {
      return;
    }
    if (!navigator.onLine) {
      showToast("You're offline. Your work is saved on this device; complete it once you're back online.");
      return;
    }
    setShowSign(true);
  };

  const finish = async (signatureDataUrl: string | null, signerName: string) => {
    if (!inspection) return;
    setCompleting(true);
    try {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (inFlight.current) await inFlight.current;
      await completeInspection(supabase, {
        inspection,
        rooms: latest.current.rooms,
        generalNotes: latest.current.generalNotes,
        signatureDataUrl,
        signerName,
      });
      savedVersion.current = version.current;
      clearLocalDraft(inspectionId);
      router.push(`/dashboard/inspections/${inspectionId}/report`);
    } catch (err) {
      setCompleting(false);
      showToast(errorMessage(err, "The inspection couldn't be completed. Your work is still saved; try again."));
    }
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (phase !== "ready" || !inspection) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-sm text-center">
          <i className={`${phase === "error" ? "ri-error-warning-line text-[#EF4444]" : "ri-clipboard-line text-[#94A3B8]"} text-3xl`}></i>
          <p className="text-sm text-[#3A3F3A] mt-3">{unavailableReason}</p>
          <div className="flex justify-center gap-2 mt-5">
            {phase === "error" && (
              <button type="button" onClick={() => window.location.reload()} className="px-4 py-2.5 text-sm font-medium bg-[#C28A78] text-white rounded-xl">
                Try again
              </button>
            )}
            <Link href="/dashboard/inspections" className="px-4 py-2.5 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl">
              Back to inspections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = progressOf(rooms);
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const issues = countIssues(rooms);
  const activeRoom = rooms[activeIndex];
  const photosEnabled = Boolean(inspection.agencyId);
  const syncLabel = SYNC_LABEL[sync];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      <header className="bg-[#C28A78] text-white px-4 pt-3 pb-4 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/inspections" aria-label="Back to inspections" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10">
              <i className="ri-arrow-left-line text-lg"></i>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold truncate">{inspection.propertyName}</h1>
              <p className="text-[11px] text-white/75 truncate">
                {inspection.typeLabel}
                {inspection.inspectorName ? ` · ${inspection.inspectorName}` : ""}
                {inspection.tenantNames.length > 0 ? ` · ${inspection.tenantNames.join(", ")}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full" aria-live="polite">
              <span className={`w-1.5 h-1.5 rounded-full ${syncLabel.dot}`}></span>
              <span className="text-[10px] font-medium whitespace-nowrap">{syncLabel.text}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#10B981] transition-all duration-500" style={{ width: `${pct}%` }}></div>
            </div>
            <span className="text-xs font-medium">{pct}%</span>
          </div>
          <p className="text-[11px] text-white/70 mt-1.5">
            {rooms.length} room{rooms.length === 1 ? "" : "s"} · {progress.done}/{progress.total} items
            {issues > 0 && <span className="text-[#FECACA]"> · {issues} issue{issues === 1 ? "" : "s"}</span>}
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4">
        {restored && (
          <div className="mt-3 bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs rounded-xl px-3 py-2">
            Restored changes saved on this device that hadn't reached the server yet.
          </div>
        )}
        {!photosEnabled && (
          <div className="mt-3 bg-[#F1F5F9] text-[#475569] text-xs rounded-xl px-3 py-2">
            Photos are turned off because this property isn't linked to an agency.
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="mt-8 text-center">
            <div className="w-16 h-16 bg-[#C28A78]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i className="ri-home-4-line text-[#C28A78] text-2xl"></i>
            </div>
            <h2 className="text-lg font-bold text-[#3A3F3A]">Add the first room</h2>
            <p className="text-xs text-[#687068] mt-1 mb-5">Each room comes with a checklist you can add to.</p>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => addRoom(t.id, t.name)}
                  className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E2E8F0] active:scale-[0.98] text-left"
                >
                  <span className="w-9 h-9 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`${t.icon} text-[#C28A78]`}></i>
                  </span>
                  <span className="text-xs font-medium text-[#3A3F3A]">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <nav className="flex gap-2 overflow-x-auto py-3 -mx-4 px-4" aria-label="Rooms">
              {rooms.map((room, idx) => {
                const answered = room.items.filter((i) => i.status).length;
                const complete = room.items.length > 0 && answered === room.items.length;
                const roomIssues = room.items.filter((i) => i.status === "fail").length;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap flex-shrink-0 text-xs font-medium ${
                      activeIndex === idx ? "bg-[#C28A78] text-white" : "bg-white text-[#687068] border border-[#E2E8F0]"
                    }`}
                  >
                    <i className={`${templateFor(room.templateId)?.icon || "ri-home-4-line"}`}></i>
                    {room.name}
                    {roomIssues > 0 && <span className={`w-1.5 h-1.5 rounded-full ${activeIndex === idx ? "bg-white" : "bg-[#EF4444]"}`}></span>}
                    {complete && roomIssues === 0 && <i className="ri-check-line text-[#10B981]"></i>}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowAddRoom(true)}
                aria-label="Add room"
                className="w-10 h-10 bg-white border-2 border-dashed border-[#CBD5E1] rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <i className="ri-add-line text-[#94A3B8]"></i>
              </button>
            </nav>

            {activeRoom && (
              <>
                <RoomChecklist
                  room={activeRoom}
                  photos={photos.filter((p) => p.roomId === activeRoom.id)}
                  photosEnabled={photosEnabled}
                  photosDisabledReason="Photos are turned off because this property isn't linked to an agency."
                  uploading={uploadingRoomId === activeRoom.id}
                  onItemStatus={(itemIndex: number, status: ItemStatus) =>
                    updateRoom(activeRoom.id, (r) => ({
                      ...r,
                      items: r.items.map((item, i) => (i === itemIndex ? { ...item, status, note: status === "fail" ? item.note : "" } : item)),
                    }))
                  }
                  onItemNote={(itemIndex: number, note: string) =>
                    updateRoom(activeRoom.id, (r) => ({
                      ...r,
                      items: r.items.map((item, i) => (i === itemIndex ? { ...item, note } : item)),
                    }))
                  }
                  onAddItem={(name: string) =>
                    updateRoom(activeRoom.id, (r) => ({ ...r, items: [...r.items, { name, status: null, note: "" }] }))
                  }
                  onRoomNotes={(notes: string) => updateRoom(activeRoom.id, (r) => ({ ...r, notes }))}
                  onRename={(name: string) => updateRoom(activeRoom.id, (r) => ({ ...r, name }))}
                  onAddPhoto={(file: File, caption: string) => void addPhoto(activeRoom, file, caption)}
                  onRemovePhoto={(photo: InspectionPhoto) => void removePhoto(photo)}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => void removeRoom(activeRoom)}
                    className="px-4 py-3 text-xs text-[#EF4444] border border-[#FECACA] rounded-xl whitespace-nowrap"
                  >
                    <i className="ri-delete-bin-line mr-1"></i>Remove room
                  </button>
                  <div className="flex-1"></div>
                  {activeIndex < rooms.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setActiveIndex(activeIndex + 1)}
                      className="px-5 py-3 bg-[#C28A78] text-white rounded-xl text-sm font-medium whitespace-nowrap"
                    >
                      Next room <i className="ri-arrow-right-s-line"></i>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddRoom(true)}
                      className="px-5 py-3 bg-white border border-[#C28A78]/40 text-[#C28A78] rounded-xl text-sm font-medium whitespace-nowrap"
                    >
                      <i className="ri-add-line"></i> Add room
                    </button>
                  )}
                </div>
              </>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 mt-6">
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-2">Overall notes</h3>
              <textarea
                value={generalNotes}
                onChange={(e) => commit(latest.current.rooms, e.target.value)}
                placeholder="Summary of the property's condition, access, anything the landlord should know"
                rows={4}
                maxLength={3000}
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78] resize-none"
              ></textarea>
            </div>

            <button
              type="button"
              onClick={startCompletion}
              className="w-full mt-4 py-4 rounded-xl text-sm font-semibold bg-[#C28A78] text-white active:opacity-90"
            >
              <i className="ri-check-double-line mr-1.5"></i>Complete inspection
            </button>
            <p className="text-center text-[11px] text-[#94A3B8] mt-2">
              You can leave and come back – everything is saved as you go.
            </p>
          </>
        )}
      </main>

      {showAddRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end" onClick={() => setShowAddRoom(false)}>
          <div className="bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto max-w-2xl w-full mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-lg font-bold text-[#3A3F3A]">Add room</h2>
              <button type="button" onClick={() => setShowAddRoom(false)} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068] text-lg"></i>
              </button>
            </div>
            <div className="px-5 pb-6 space-y-2">
              {ROOM_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => addRoom(t.id, t.name)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#E2E8F0] active:scale-[0.98]"
                >
                  <span className="w-10 h-10 bg-[#C28A78]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className={`${t.icon} text-[#C28A78]`}></i>
                  </span>
                  <span className="flex-1 text-left">
                    <span className="block text-sm font-medium text-[#3A3F3A]">{t.name}</span>
                    <span className="block text-[11px] text-[#94A3B8]">{t.items.length} checklist items</span>
                  </span>
                  <i className="ri-add-line text-[#94A3B8]"></i>
                </button>
              ))}
              <form
                className="flex gap-2 pt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = customRoomName.trim();
                  if (name) addRoom(null, name);
                }}
              >
                <input
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  maxLength={60}
                  placeholder="Other room (e.g. Conservatory)"
                  className="flex-1 px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]"
                />
                <button type="submit" className="px-4 py-3 text-sm font-medium bg-[#C28A78] text-white rounded-xl whitespace-nowrap">
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showSign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5">
            <SignaturePad
              initialName={inspection.inspectorName}
              busy={completing}
              onCancel={() => setShowSign(false)}
              onConfirm={(sig, name) => void finish(sig, name)}
            />
          </div>
        </div>
      )}

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] bg-[#3A3F3A] text-white text-sm px-4 py-3 rounded-xl shadow-lg max-w-[90vw]">
          {toast}
        </div>
      )}
    </div>
  );
}
