"use client";

import { useState, useRef, useCallback } from "react";
import type { InspectionPhoto, VoiceNote } from "./data";

interface RoomInspectorProps {
  roomName: string;
  templateId: string;
  items: { name: string; status: "pass" | "fail" | "na"; note?: string }[];
  photos: InspectionPhoto[];
  voiceNotes: VoiceNote[];
  generalNote: string;
  onItemChange: (itemIndex: number, status: "pass" | "fail" | "na") => void;
  onItemNoteChange: (itemIndex: number, note: string) => void;
  onPhotoAdd: (photo: InspectionPhoto) => void;
  onPhotoRemove: (photoId: string) => void;
  onVoiceNoteAdd: (note: VoiceNote) => void;
  onVoiceNoteRemove: (noteId: string) => void;
  onGeneralNoteChange: (note: string) => void;
}

export default function RoomInspector({
  roomName,
  items,
  photos,
  voiceNotes,
  generalNote,
  onItemChange,
  onItemNoteChange,
  onPhotoAdd,
  onPhotoRemove,
  onVoiceNoteAdd,
  onVoiceNoteRemove,
  onGeneralNoteChange,
}: RoomInspectorProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [photoLabel, setPhotoLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleCameraCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const now = new Date();
      const gpsLat = (window as any).__lethub_gps_lat;
      const gpsLng = (window as any).__lethub_gps_lng;

      onPhotoAdd({
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        dataUrl: reader.result as string,
        timestamp: now.toISOString(),
        gpsLat: gpsLat || undefined,
        gpsLng: gpsLng || undefined,
        label: photoLabel || undefined,
      });
      setPhotoLabel("");
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onPhotoAdd, photoLabel]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          onVoiceNoteAdd({
            id: `voice-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            dataUrl: reader.result as string,
            timestamp: new Date().toISOString(),
            duration: recordingTime,
          });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      // Microphone access denied
    }
  }, [onVoiceNoteAdd, recordingTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const passedCount = items.filter((i) => i.status === "pass").length;
  const failedCount = items.filter((i) => i.status === "fail").length;
  const totalCount = items.length;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#3A3F3A]">{roomName}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
              {passedCount} Pass
            </span>
            {failedCount > 0 && (
              <span className="text-xs font-medium text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full">
                {failedCount} Fail
              </span>
            )}
            <span className="text-xs text-[#94A3B8]">{totalCount - passedCount - failedCount} left</span>
          </div>
        </div>

        <div className="space-y-0">
          {items.map((item, idx) => (
            <div key={idx} className="border-b border-[#F1F5F9] last:border-0">
              <div className="flex items-center justify-between py-3 min-h-[52px]">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-sm text-[#3A3F3A]">{item.name}</p>
                  {item.note && (
                    <p className="text-[10px] text-[#F59E0B] mt-0.5 truncate">{item.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onItemChange(idx, "pass")}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                      item.status === "pass"
                        ? "bg-[#10B981] text-white shadow-sm"
                        : "bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#10B981]/20"
                    }`}
                  >
                    <i className="ri-check-line text-lg"></i>
                  </button>
                  <button
                    onClick={() => onItemChange(idx, "fail")}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                      item.status === "fail"
                        ? "bg-[#EF4444] text-white shadow-sm"
                        : "bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#EF4444]/20"
                    }`}
                  >
                    <i className="ri-close-line text-lg"></i>
                  </button>
                  <button
                    onClick={() => {
                      if (item.status === "fail") {
                        const note = prompt("What's the issue?", item.note || "");
                        if (note !== null) onItemNoteChange(idx, note);
                      } else {
                        onItemChange(idx, "na");
                      }
                    }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                      item.status === "na"
                        ? "bg-[#94A3B8] text-white shadow-sm"
                        : "bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#94A3B8]/20"
                    }`}
                  >
                    <span className="text-xs font-bold">N/A</span>
                  </button>
                </div>
              </div>
              {item.status === "fail" && !item.note && (
                <div className="pb-2 -mt-1">
                  <button
                    onClick={() => {
                      const note = prompt("Describe the issue:", "");
                      if (note !== null) onItemNoteChange(idx, note);
                    }}
                    className="text-[10px] text-[#EF4444] underline"
                  >
                    + Add issue note
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3 flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-camera-line text-[#C28A78]"></i>
          </div>
          Photos
        </h3>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] rounded-xl flex flex-col items-center justify-center flex-shrink-0 hover:border-[#C28A78] transition-colors active:scale-95"
          >
            <div className="w-7 h-7 flex items-center justify-center">
              <i className="ri-add-line text-[#94A3B8] text-lg"></i>
            </div>
            <span className="text-[10px] text-[#94A3B8] mt-1">Add Photo</span>
          </button>
          {photos.map((photo) => (
            <div key={photo.id} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
              <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => onPhotoRemove(photo.id)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
              >
                <i className="ri-close-line text-white text-[10px]"></i>
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-1.5 py-0.5">
                <p className="text-[8px] text-white">
                  {new Date(photo.timestamp).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                  {photo.label && ` · ${photo.label}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {photos.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={photoLabel}
              onChange={(e) => setPhotoLabel(e.target.value)}
              placeholder="Next photo label..."
              className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]"
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3 flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-mic-line text-[#C28A78]"></i>
          </div>
          Voice Notes
        </h3>

        {voiceNotes.map((note) => (
          <div key={note.id} className="flex items-center gap-3 py-2 border-b border-[#F1F5F9] last:border-0">
            <div className="w-10 h-10 bg-[#C28A78]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-mic-fill text-[#C28A78]"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#3A3F3A]">Voice Note</p>
              <p className="text-[10px] text-[#94A3B8]">
                {new Date(note.timestamp).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })} · {note.duration}s
              </p>
            </div>
            <button
              onClick={() => onVoiceNoteRemove(note.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEF2F2]"
            >
              <i className="ri-delete-bin-line text-[#EF4444] text-sm"></i>
            </button>
          </div>
        ))}

        <div className="mt-3 flex items-center gap-3">
          {isRecording ? (
            <div className="flex-1 flex items-center gap-3 bg-[#FEF2F2] rounded-xl px-4 py-3">
              <div className="w-3 h-3 rounded-full bg-[#EF4444] animate-pulse flex-shrink-0"></div>
              <span className="text-sm font-mono text-[#EF4444]">{formatTime(recordingTime)}</span>
              <button
                onClick={stopRecording}
                className="ml-auto w-10 h-10 bg-[#EF4444] text-white rounded-xl flex items-center justify-center active:scale-90"
              >
                <i className="ri-stop-fill"></i>
              </button>
            </div>
          ) : (
            <button
              onClick={startRecording}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] transition-colors active:scale-[0.98]"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-mic-line text-[#C28A78]"></i>
              </div>
              <span className="text-sm text-[#687068]">Tap to record</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#3A3F3A] mb-2">Room Notes</h3>
        <textarea
          value={generalNote}
          onChange={(e) => onGeneralNoteChange(e.target.value)}
          placeholder="Any general observations about this room..."
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78] resize-none"
        ></textarea>
        <p className="text-[10px] text-[#94A3B8] text-right mt-1">{generalNote.length}/500</p>
      </div>
    </div>
  );
}