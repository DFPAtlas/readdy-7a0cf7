"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface SignaturePadProps {
  onSave: (dataUrl: string, name: string) => void;
  onSkip: () => void;
}

export default function SignaturePad({ onSave, onSkip }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 200 });

  useEffect(() => {
    if (containerRef.current) {
      const w = containerRef.current.clientWidth;
      setCanvasSize({ width: w, height: 200 });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    ctx.strokeStyle = "#C28A78";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [canvasSize]);

  const getPos = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    if ("clientX" in e) {
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    return { x: 0, y: 0 };
  }, []);

  const startDrawing = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasSignature(true);
  }, [getPos]);

  const draw = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, getPos]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }, []);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl, signerName || "Inspector");
  }, [hasSignature, signerName, onSave]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4 flex items-center gap-2">
        <div className="w-6 h-6 flex items-center justify-center">
          <i className="ri-pen-nib-line text-[#C28A78]"></i>
        </div>
        Digital Signature
      </h3>

      <p className="text-xs text-[#687068] mb-2">Sign below to confirm this inspection report</p>

      <div ref={containerRef} className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="w-full border-2 border-dashed border-[#CBD5E1] rounded-xl bg-[#F8FAFC] touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-[#CBD5E1] pointer-events-none">
            Sign here
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={clear}
          className="px-4 py-2.5 text-xs text-[#687068] border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] whitespace-nowrap"
        >
          Clear
        </button>
        <input
          type="text"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="Your name"
          className="flex-1 px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-xs bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]"
        />
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onSkip}
          className="flex-1 py-3 text-sm text-[#687068] border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] whitespace-nowrap"
        >
          Skip
        </button>
        <button
          onClick={handleSave}
          disabled={!hasSignature}
          className={`flex-1 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${
            hasSignature
              ? "bg-[#C28A78] text-white active:bg-[#143329]"
              : "bg-[#F1F5F9] text-[#94A3B8]"
          }`}
        >
          <i className="ri-check-line mr-1"></i>
          Save Signature
        </button>
      </div>
    </div>
  );
}