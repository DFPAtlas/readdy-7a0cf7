"use client";

import { useRef, useState } from "react";
import type { InspectionPhoto, InspectionRoom, ItemStatus } from "@/lib/inspections";

interface RoomChecklistProps {
  room: InspectionRoom;
  photos: InspectionPhoto[];
  photosEnabled: boolean;
  photosDisabledReason: string;
  uploading: boolean;
  onItemStatus: (itemIndex: number, status: ItemStatus) => void;
  onItemNote: (itemIndex: number, note: string) => void;
  onAddItem: (name: string) => void;
  onRoomNotes: (notes: string) => void;
  onRename: (name: string) => void;
  onAddPhoto: (file: File, caption: string) => void;
  onRemovePhoto: (photo: InspectionPhoto) => void;
}

const STATUS_BUTTONS: { status: ItemStatus; label: string; icon?: string; on: string }[] = [
  { status: "pass", label: "Pass", icon: "ri-check-line", on: "bg-[#10B981] text-white" },
  { status: "fail", label: "Issue", icon: "ri-close-line", on: "bg-[#EF4444] text-white" },
  { status: "na", label: "N/A", on: "bg-[#94A3B8] text-white" },
];

export default function RoomChecklist({
  room,
  photos,
  photosEnabled,
  photosDisabledReason,
  uploading,
  onItemStatus,
  onItemNote,
  onAddItem,
  onRoomNotes,
  onRename,
  onAddPhoto,
  onRemovePhoto,
}: RoomChecklistProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [newItem, setNewItem] = useState("");
  const [editingName, setEditingName] = useState(false);

  const passed = room.items.filter((i) => i.status === "pass").length;
  const failed = room.items.filter((i) => i.status === "fail").length;
  const left = room.items.filter((i) => !i.status).length;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          {editingName ? (
            <input
              autoFocus
              defaultValue={room.name}
              maxLength={60}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value) onRename(value);
                setEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="flex-1 min-w-0 px-3 py-1.5 border border-[#C28A78] rounded-lg text-base font-bold text-[#3A3F3A] focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 min-w-0 text-left"
              aria-label="Rename room"
            >
              <h2 className="text-base font-bold text-[#3A3F3A] truncate">{room.name}</h2>
              <i className="ri-pencil-line text-xs text-[#94A3B8]"></i>
            </button>
          )}
          <div className="flex items-center gap-1.5 flex-shrink-0 text-xs">
            <span className="font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">{passed} pass</span>
            {failed > 0 && (
              <span className="font-medium text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full">{failed} issue{failed === 1 ? "" : "s"}</span>
            )}
            {left > 0 && <span className="text-[#94A3B8]">{left} left</span>}
          </div>
        </div>

        <ul>
          {room.items.map((item, idx) => (
            <li key={`${item.name}-${idx}`} className="border-b border-[#F1F5F9] last:border-0 py-2.5">
              <div className="flex items-center justify-between gap-2 min-h-[44px]">
                <p className="text-sm text-[#3A3F3A] flex-1 min-w-0">{item.name}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0" role="group" aria-label={`${item.name} result`}>
                  {STATUS_BUTTONS.map((b) => (
                    <button
                      key={b.status}
                      type="button"
                      onClick={() => onItemStatus(idx, b.status)}
                      aria-pressed={item.status === b.status}
                      aria-label={b.label}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                        item.status === b.status ? `${b.on} shadow-sm` : "bg-[#F1F5F9] text-[#94A3B8]"
                      }`}
                    >
                      {b.icon ? <i className={`${b.icon} text-lg`}></i> : <span className="text-xs font-bold">{b.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
              {item.status === "fail" && (
                <input
                  value={item.note}
                  onChange={(e) => onItemNote(idx, e.target.value)}
                  maxLength={300}
                  placeholder="Describe the issue (e.g. crack above window, tap dripping)"
                  className="mt-1.5 w-full px-3 py-2 border border-[#FECACA] rounded-lg text-sm text-[#3A3F3A] bg-[#FEF2F2] placeholder:text-[#C46868]/60 focus:outline-none focus:border-[#EF4444]"
                />
              )}
            </li>
          ))}
        </ul>

        <form
          className="flex items-center gap-2 mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            const name = newItem.trim();
            if (!name) return;
            onAddItem(name);
            setNewItem("");
          }}
        >
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            maxLength={80}
            placeholder="Add a checklist item"
            className="flex-1 px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]"
          />
          <button type="submit" className="px-4 py-2.5 text-sm font-medium text-[#C28A78] border border-[#C28A78]/40 rounded-xl whitespace-nowrap">
            Add
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3 flex items-center gap-2">
          <i className="ri-camera-line text-[#C28A78]"></i>
          Photos
        </h3>

        {photosEnabled ? (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-24 h-24 bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] rounded-xl flex flex-col items-center justify-center flex-shrink-0 active:scale-95 disabled:opacity-60"
              >
                {uploading ? (
                  <span className="w-6 h-6 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <i className="ri-add-line text-[#94A3B8] text-xl"></i>
                )}
                <span className="text-[10px] text-[#94A3B8] mt-1">{uploading ? "Uploading" : "Add photo"}</span>
              </button>
              {photos.map((photo) => (
                <div key={photo.id} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-[#F1F5F9]">
                  {photo.url ? (
                    <img src={photo.url} alt={photo.caption || `${room.name} photo`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[#94A3B8]">Saved</div>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(photo)}
                    aria-label="Remove photo"
                    className="absolute top-1 right-1 w-6 h-6 bg-black/55 rounded-full flex items-center justify-center"
                  >
                    <i className="ri-close-line text-white text-xs"></i>
                  </button>
                  {(photo.caption || photo.takenAt) && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/45 px-1.5 py-0.5">
                      <p className="text-[9px] text-white truncate">
                        {photo.caption || new Date(photo.takenAt || "").toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={120}
              placeholder="Caption for the next photo (optional)"
              className="mt-2 w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onAddPhoto(file, caption);
                  setCaption("");
                }
                e.target.value = "";
              }}
            />
          </>
        ) : (
          <p className="text-xs text-[#94A3B8]">{photosDisabledReason}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-[#3A3F3A] mb-2">Room notes</h3>
        <textarea
          value={room.notes}
          onChange={(e) => onRoomNotes(e.target.value)}
          placeholder="General observations about this room"
          rows={3}
          maxLength={1000}
          className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78] resize-none"
        ></textarea>
      </div>
    </div>
  );
}
