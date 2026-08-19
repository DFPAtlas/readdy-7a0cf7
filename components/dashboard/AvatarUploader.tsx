"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AvatarUploaderProps {
  userId: string;
  currentUrl: string | null;
  userName: string;
  role: string;
  onAvatarUpdate: (url: string) => void;
  collapsed?: boolean;
}

export default function AvatarUploader({
  userId,
  currentUrl,
  userName,
  role,
  onAvatarUpdate,
  collapsed,
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initial = userName.charAt(0).toUpperCase();

  const roleColours: Record<string, string> = {
    platform_admin: "bg-purple-500",
    estate_agent_admin: "bg-amber-500",
    estate_agent_staff: "bg-blue-500",
    landlord: "bg-emerald-500",
    tenant: "bg-sky-500",
    contractor: "bg-orange-500",
    suspended: "bg-red-500",
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `avatars/${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      onAvatarUpdate(publicUrl);
    } catch {
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const showImage = currentUrl && !uploading;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative flex items-center justify-center rounded-full flex-shrink-0 transition-all cursor-pointer ${
          collapsed ? "h-8 w-8" : "h-8 w-8"
        } ${showImage ? "" : roleColours[role] || "bg-gray-500"}`}
        title="Change photo"
      >
        {showImage ? (
          <img
            src={currentUrl!}
            alt={userName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : uploading ? (
          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <span className="text-sm font-bold text-white">{initial}</span>
        )}

        {hovered && !uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className="ri-camera-line text-white text-xs"></i>
            </div>
          </div>
        )}
      </button>
    </>
  );
}