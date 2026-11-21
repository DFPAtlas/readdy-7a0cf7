"use client";

import { useEffect, useRef, useState } from "react";

interface SignaturePadProps {
  initialName: string;
  busy: boolean;
  onConfirm: (signatureDataUrl: string | null, name: string) => void;
  onCancel: () => void;
}

export default function SignaturePad({ initialName, busy, onConfirm, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [name, setName] = useState(initialName);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.strokeStyle = "#1F2937";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    drawing.current = true;
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasInk(true);
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setHasInk(false);
  };

  return (
    <div>
      <h3 className="text-base font-bold text-[#3A3F3A] mb-1">Sign and complete</h3>
      <p className="text-xs text-[#687068] mb-3">
        Sign to confirm this inspection is an accurate record. You can complete without a signature.
      </p>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-44 border-2 border-dashed border-[#CBD5E1] rounded-xl bg-[#F8FAFC] touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
        />
        {!hasInk && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-[#CBD5E1] pointer-events-none">Sign here</p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button type="button" onClick={clear} className="px-4 py-2.5 text-xs text-[#687068] border border-[#E2E8F0] rounded-xl whitespace-nowrap">
          Clear
        </button>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          placeholder="Name of person signing"
          className="flex-1 px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]"
        />
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="px-4 py-3 text-sm text-[#687068] border border-[#E2E8F0] rounded-xl whitespace-nowrap"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onConfirm(null, name)}
          disabled={busy}
          className="flex-1 py-3 text-sm text-[#3A3F3A] border border-[#E2E8F0] rounded-xl whitespace-nowrap disabled:opacity-60"
        >
          Complete without signing
        </button>
        <button
          type="button"
          onClick={() => onConfirm(canvasRef.current && hasInk ? canvasRef.current.toDataURL("image/png") : null, name)}
          disabled={busy || !hasInk}
          className="flex-1 py-3 text-sm font-medium rounded-xl whitespace-nowrap bg-[#C28A78] text-white disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]"
        >
          {busy ? "Saving..." : "Sign & complete"}
        </button>
      </div>
    </div>
  );
}
