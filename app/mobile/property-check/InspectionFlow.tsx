"use client";

import { useState, useEffect, useCallback } from "react";
import RoomInspector from "./RoomInspector";
import SignaturePad from "./SignaturePad";
import {
  roomTemplates,
  sampleProperties,
  inspectionTypes,
  generateInspectionId,
  saveDraft,
  loadDraft,
  deleteDraft,
  addToOfflineQueue,
  getOfflineQueue,
} from "./data";
import type { RoomCheckResult, InspectionDraft, CompletedInspection } from "./data";

interface InspectionFlowProps {
  draftId?: string | null;
  propertyId?: string;
  typeId?: string;
  onBack: () => void;
  onComplete: () => void;
}

export default function InspectionFlow({ draftId, propertyId, typeId, onBack, onComplete }: InspectionFlowProps) {
  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const [showSignature, setShowSignature] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setOfflineQueueCount(getOfflineQueue().length);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGpsLocation(loc);
          (window as any).__lethub_gps_lat = loc.lat;
          (window as any).__lethub_gps_lng = loc.lng;
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (draftId) {
      const loaded = loadDraft(draftId);
      if (loaded) setDraft(loaded);
    } else if (propertyId) {
      const prop = sampleProperties.find((p) => p.id === propertyId);
      const typeLabel = inspectionTypes.find((t) => t.id === typeId)?.label || "Inspection";
      if (prop) {
        setDraft({
          id: generateInspectionId(),
          propertyId: prop.id,
          propertyName: prop.name,
          propertyAddress: prop.address,
          tenantName: prop.tenant,
          inspectorName: "Sarah Collins",
          type: typeLabel,
          startedAt: new Date().toISOString(),
          lastSavedAt: new Date().toISOString(),
          rooms: [],
          generalNotes: "",
          progress: { total: 0, done: 0 },
        });
      }
    }
  }, [draftId, propertyId, typeId]);

  const autosave = useCallback((currentDraft: InspectionDraft) => {
    if (!currentDraft) return;
    const updated = {
      ...currentDraft,
      lastSavedAt: new Date().toISOString(),
      progress: calcProgress(currentDraft.rooms),
    };
    saveDraft(updated);
    setDraft(updated);
  }, []);

  const calcProgress = (rooms: RoomCheckResult[]) => {
    let total = 0;
    let done = 0;
    rooms.forEach((r) => {
      r.items.forEach((i) => {
        total++;
        if (i.status === "pass" || i.status === "fail" || i.status === "na") done++;
      });
    });
    return { total, done };
  };

  if (!draft) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const handleItemChange = (roomIndex: number, itemIndex: number, status: "pass" | "fail" | "na") => {
    const rooms = [...draft.rooms];
    rooms[roomIndex].items[itemIndex].status = status;
    if (status === "pass") rooms[roomIndex].items[itemIndex].note = undefined;
    const updated = { ...draft, rooms };
    autosave(updated);
  };

  const handleItemNoteChange = (roomIndex: number, itemIndex: number, note: string) => {
    const rooms = [...draft.rooms];
    rooms[roomIndex].items[itemIndex].note = note;
    autosave({ ...draft, rooms });
  };

  const handlePhotoAdd = (roomIndex: number, photo: any) => {
    const rooms = [...draft.rooms];
    rooms[roomIndex].photos.push(photo);
    autosave({ ...draft, rooms });
  };

  const handlePhotoRemove = (roomIndex: number, photoId: string) => {
    const rooms = [...draft.rooms];
    rooms[roomIndex].photos = rooms[roomIndex].photos.filter((p) => p.id !== photoId);
    autosave({ ...draft, rooms });
  };

  const handleVoiceAdd = (roomIndex: number, note: any) => {
    const rooms = [...draft.rooms];
    rooms[roomIndex].voiceNotes.push(note);
    autosave({ ...draft, rooms });
  };

  const handleVoiceRemove = (roomIndex: number, noteId: string) => {
    const rooms = [...draft.rooms];
    rooms[roomIndex].voiceNotes = rooms[roomIndex].voiceNotes.filter((v) => v.id !== noteId);
    autosave({ ...draft, rooms });
  };

  const handleRoomNoteChange = (roomIndex: number, note: string) => {
    const rooms = [...draft.rooms];
    rooms[roomIndex].generalNote = note;
    autosave({ ...draft, rooms });
  };

  const handleAddRoom = (templateId: string) => {
    const template = roomTemplates.find((t) => t.id === templateId);
    if (!template) return;
    const newRoom: RoomCheckResult = {
      templateId: template.id,
      roomName: template.name,
      items: template.defaultItems.map((name) => ({ name, status: undefined as any })),
      photos: [],
      voiceNotes: [],
      generalNote: "",
    };
    const rooms = [...draft.rooms, newRoom];
    autosave({ ...draft, rooms });
    setActiveRoomIndex(rooms.length - 1);
    setShowAddRoom(false);
  };

  const handleRemoveRoom = (index: number) => {
    const rooms = draft.rooms.filter((_, i) => i !== index);
    autosave({ ...draft, rooms });
    if (activeRoomIndex >= rooms.length && rooms.length > 0) {
      setActiveRoomIndex(rooms.length - 1);
    }
  };

  const handleSignatureSave = (dataUrl: string, name: string) => {
    autosave({ ...draft, signature: dataUrl, signatureName: name });
    setShowSignature(false);
    handleSubmit(dataUrl, name);
  };

  const handleSkipSignature = () => {
    setShowSignature(false);
    handleSubmit(undefined, undefined);
  };

  const handleSubmit = (signatureDataUrl?: string, signatureName?: string) => {
    const totalIssues = draft.rooms.reduce((sum, r) => sum + r.items.filter((i) => i.status === "fail").length, 0);
    const passedCount = draft.rooms.reduce((sum, r) => sum + r.items.filter((i) => i.status === "pass").length, 0);
    const rating = totalIssues === 0 ? "Excellent" : totalIssues <= 3 ? "Good" : totalIssues <= 6 ? "Fair" : "Poor";

    const completed: CompletedInspection = {
      id: draft.id,
      propertyId: draft.propertyId,
      propertyName: draft.propertyName,
      propertyAddress: draft.propertyAddress,
      type: draft.type,
      date: new Date().toISOString().split("T")[0],
      inspector: draft.inspectorName,
      tenant: draft.tenantName,
      rooms: draft.rooms.length,
      issues: totalIssues,
      rating,
      synced: isOnline,
    };

    if (!isOnline) {
      addToOfflineQueue(completed);
    }

    deleteDraft(draft.id);
    onComplete();
  };

  const progress = calcProgress(draft.rooms);
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const activeRoom = draft.rooms[activeRoomIndex];

  const totalIssues = draft.rooms.reduce((sum, r) => sum + r.items.filter((i) => i.status === "fail").length, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28">
      <div className="bg-[#C28A78] text-white px-4 pt-3 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10">
            <i className="ri-arrow-left-line text-white text-lg"></i>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">{draft.propertyName}</h1>
            <p className="text-[10px] text-white/70 truncate">{draft.type} · {draft.inspectorName}</p>
          </div>
          {!isOnline && (
            <div className="flex items-center gap-1.5 bg-[#F59E0B]/20 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>
              <span className="text-[10px] text-[#F59E0B] font-medium">Offline</span>
            </div>
          )}
          {gpsLocation && (
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-map-pin-line text-[10px] text-[#10B981]"></i>
              </div>
              <span className="text-[9px] text-white/70">GPS</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? "#10B981" : "linear-gradient(90deg, #10B981, #14B8A6)",
              }}
            ></div>
          </div>
          <span className="text-xs font-medium whitespace-nowrap">{pct}%</span>
        </div>

        <div className="flex items-center gap-2 mt-2 text-[10px] text-white/60">
          <span>{draft.rooms.length} rooms</span>
          <span>·</span>
          <span>{progress.done}/{progress.total} items</span>
          {totalIssues > 0 && (
            <>
              <span>·</span>
              <span className="text-[#F87171]">{totalIssues} issues</span>
            </>
          )}
        </div>
      </div>

      {draft.rooms.length === 0 ? (
        <div className="px-4 mt-8 text-center">
          <div className="w-20 h-20 bg-[#C28A78]/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-home-4-line text-[#C28A78] text-3xl"></i>
          </div>
          <h2 className="text-lg font-bold text-[#3A3F3A] mb-1">Add Your First Room</h2>
          <p className="text-xs text-[#687068] mb-6">Select a room template to begin the inspection</p>

          <div className="grid grid-cols-2 gap-2">
            {roomTemplates.slice(0, 8).map((t) => (
              <button
                key={t.id}
                onClick={() => handleAddRoom(t.id)}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#C28A78] transition-colors active:scale-[0.98]"
              >
                <div className="w-9 h-9 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`${t.icon} text-[#C28A78] text-sm`}></i>
                </div>
                <span className="text-xs font-medium text-[#3A3F3A] text-left">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="px-4 pt-3">
            <div className="flex gap-2 overflow-x-auto pb-3">
              {draft.rooms.map((room, idx) => {
                const done = room.items.filter((i) => i.status === "pass" || i.status === "fail" || i.status === "na").length;
                const pctRoom = room.items.length > 0 ? Math.round((done / room.items.length) * 100) : 0;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveRoomIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-colors flex-shrink-0 ${
                      activeRoomIndex === idx
                        ? "bg-[#C28A78] text-white"
                        : "bg-white text-[#687068] border border-[#E2E8F0]"
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className={`${roomTemplates.find((t) => t.id === room.templateId)?.icon || "ri-home-4-line"} text-xs`}></i>
                    </div>
                    <span className="text-xs font-medium">{room.roomName}</span>
                    {pctRoom === 100 && (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-check-fill text-[10px] text-[#10B981]"></i>
                      </div>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => setShowAddRoom(true)}
                className="w-10 h-10 bg-white border-2 border-dashed border-[#CBD5E1] rounded-xl flex items-center justify-center flex-shrink-0 hover:border-[#C28A78]"
              >
                <i className="ri-add-line text-[#94A3B8]"></i>
              </button>
            </div>
          </div>

          <div className="px-4">
            {activeRoom && (
              <>
                <RoomInspector
                  roomName={activeRoom.roomName}
                  templateId={activeRoom.templateId}
                  items={activeRoom.items}
                  photos={activeRoom.photos}
                  voiceNotes={activeRoom.voiceNotes}
                  generalNote={activeRoom.generalNote}
                  onItemChange={(itemIdx, status) => handleItemChange(activeRoomIndex, itemIdx, status)}
                  onItemNoteChange={(itemIdx, note) => handleItemNoteChange(activeRoomIndex, itemIdx, note)}
                  onPhotoAdd={(photo) => handlePhotoAdd(activeRoomIndex, photo)}
                  onPhotoRemove={(photoId) => handlePhotoRemove(activeRoomIndex, photoId)}
                  onVoiceNoteAdd={(note) => handleVoiceAdd(activeRoomIndex, note)}
                  onVoiceNoteRemove={(noteId) => handleVoiceRemove(activeRoomIndex, noteId)}
                  onGeneralNoteChange={(note) => handleRoomNoteChange(activeRoomIndex, note)}
                />

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleRemoveRoom(activeRoomIndex)}
                    className="px-4 py-3 text-xs text-[#EF4444] border border-[#FECACA] rounded-xl hover:bg-[#FEF2F2] whitespace-nowrap"
                  >
                    <i className="ri-delete-bin-line mr-1"></i>
                    Remove Room
                  </button>
                  <div className="flex-1"></div>
                  {activeRoomIndex < draft.rooms.length - 1 && (
                    <button
                      onClick={() => setActiveRoomIndex(activeRoomIndex + 1)}
                      className="px-5 py-3 bg-[#C28A78] text-white rounded-xl text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
                    >
                      Next Room
                      <i className="ri-arrow-right-s-line"></i>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="px-4 mt-6 space-y-3">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-2">General Property Notes</h3>
              <textarea
                value={draft.generalNotes}
                onChange={(e) => autosave({ ...draft, generalNotes: e.target.value })}
                placeholder="Any overall observations about the property..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78] resize-none"
              ></textarea>
            </div>

            {draft.signature ? (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-2">Signature</h3>
                <img src={draft.signature} alt="Signature" className="h-16 border-b-2 border-[#C28A78]" />
                <p className="text-xs text-[#687068] mt-1">{draft.signatureName}</p>
              </div>
            ) : null}

            <button
              onClick={() => setShowSignature(true)}
              className="w-full py-4 rounded-xl text-sm font-medium transition-colors whitespace-nowrap bg-[#C28A78] text-white active:bg-[#143329]"
            >
              <i className="ri-check-double-line mr-1.5"></i>
              Complete Inspection
            </button>

            {!isOnline && offlineQueueCount > 0 && (
              <p className="text-center text-xs text-[#F59E0B]">
                {offlineQueueCount} inspection(s) queued for sync when back online
              </p>
            )}
          </div>
        </>
      )}

      {showAddRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-lg font-bold text-[#3A3F3A]">Add Room</h2>
              <button
                onClick={() => setShowAddRoom(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F1F5F9]"
              >
                <i className="ri-close-line text-[#687068] text-lg"></i>
              </button>
            </div>
            <div className="px-5 pb-6 space-y-2">
              {roomTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleAddRoom(t.id)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-[#E2E8F0] hover:border-[#C28A78] transition-colors active:scale-[0.98]"
                >
                  <div className="w-10 h-10 bg-[#C28A78]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className={`${t.icon} text-[#C28A78]`}></i>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-[#3A3F3A]">{t.name}</p>
                    <p className="text-[10px] text-[#94A3B8]">{t.defaultItems.length} checklist items</p>
                  </div>
                  <i className="ri-add-line text-[#94A3B8]"></i>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSignature && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto p-5">
            <SignaturePad onSave={handleSignatureSave} onSkip={handleSkipSignature} />
          </div>
        </div>
      )}
    </div>
  );
}